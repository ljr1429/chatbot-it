#!/usr/bin/env python3
"""
scripts/index_pdf.py
KITPM PDF 문서를 Supabase rag_chunks 테이블에 인덱싱

사용법:
  pip install openai supabase pdfminer.six python-dotenv tqdm
  
  export OPENAI_API_KEY=...
  export NEXT_PUBLIC_SUPABASE_URL=...
  export SUPABASE_SERVICE_ROLE=...
  
  python scripts/index_pdf.py data/KITPM_2026년_논문_투고안내.pdf
"""

import os
import sys
import re
from typing import List, Tuple
from tqdm import tqdm
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

assert SUPABASE_URL and SUPABASE_SERVICE_ROLE and OPENAI_API_KEY, (
    "환경 변수를 설정해주세요: "
    "NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE, OPENAI_API_KEY"
)

# PDF 텍스트 추출
from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextContainer, LAParams


def extract_pdf_with_pages(pdf_path: str) -> List[Tuple[int, str]]:
    """PDF에서 페이지별 텍스트 추출"""
    laparams = LAParams()
    result = []
    for page_num, page_layout in enumerate(extract_pages(pdf_path, laparams=laparams), start=1):
        texts = []
        for element in page_layout:
            if isinstance(element, LTTextContainer):
                texts.append(element.get_text())
        page_text = "".join(texts)
        # 공백 정규화
        page_text = re.sub(r"[ \t]+", " ", page_text)
        page_text = re.sub(r"\n{3,}", "\n\n", page_text)
        result.append((page_num, page_text.strip()))
    return result


# 청킹
def split_into_chunks(text: str, target: int = 900, overlap: int = 150) -> List[str]:
    """단락 기준 청킹 (표/섹션 보존)"""
    paragraphs = re.split(r"\n{2,}", text)
    chunks = []
    current = ""
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
            
        if len(current) + len(para) + 2 <= target:
            current = (current + "\n\n" + para).strip()
        else:
            if current:
                chunks.append(current)
                # 오버랩 테일 생성
                tail = current[-overlap:] if len(current) > overlap else current
                current = (tail + "\n\n" + para).strip()
            else:
                # 단일 단락이 target보다 큰 경우
                for i in range(0, len(para), target):
                    chunks.append(para[i : i + target])
                current = ""
    
    if current:
        chunks.append(current)
    
    return [c.strip() for c in chunks if c.strip()]


def guess_section(text: str) -> str:
    """섹션명 추측 (첫 줄의 헤딩 추출)"""
    first_line = text.splitlines()[0] if text else ""
    return first_line[:80]


# OpenAI 임베딩
from openai import OpenAI

client = OpenAI(api_key=OPENAI_API_KEY)


def embed_batch(texts: List[str]) -> List[List[float]]:
    """배치 임베딩 생성"""
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=texts
    )
    return [d.embedding for d in response.data]


# Supabase 업서트
from supabase import create_client, Client

sb: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE)


def insert_chunk(doc_name: str, section: str, page: int, content: str, embedding: List[float]):
    """청크를 rag_chunks에 삽입"""
    row = {
        "doc_name": doc_name,
        "section": section,
        "page": page,
        "content": content,
        "embedding": embedding,
    }
    sb.table("rag_chunks").insert(row).execute()


def delete_existing_doc(doc_name: str):
    """기존 문서의 청크 삭제 (재인덱싱 시)"""
    sb.table("rag_chunks").delete().eq("doc_name", doc_name).execute()


def main(pdf_path: str):
    """메인 인덱싱 프로세스"""
    if not os.path.exists(pdf_path):
        print(f"오류: 파일을 찾을 수 없습니다: {pdf_path}")
        sys.exit(1)

    # 문서명 추출
    filename = os.path.basename(pdf_path)
    doc_name = filename.replace(".pdf", "")
    
    print(f"문서 인덱싱 시작: {doc_name}")
    
    # 기존 청크 삭제
    print(f"기존 '{doc_name}' 청크 삭제 중...")
    delete_existing_doc(doc_name)
    
    # PDF 추출
    print("PDF 텍스트 추출 중...")
    pages = extract_pdf_with_pages(pdf_path)
    
    # 디버그: 페이지 정보 출력
    print(f"\n=== 디버그 정보 ===")
    print(f"총 페이지 수: {len(pages)}")
    for i, (page_num, text) in enumerate(pages[:3]):  # 처음 3페이지만
        print(f"\n페이지 {page_num} 텍스트 길이: {len(text)} 자")
        print(f"페이지 {page_num} 처음 200자: {text[:200]}")
    print(f"===================\n")
    
    # 청킹
    print("청크 생성 중...")
    all_chunks = []
    for page_num, page_text in pages:
        chunks = split_into_chunks(page_text, target=900, overlap=150)
        print(f"페이지 {page_num}: {len(chunks)}개 청크 생성")
        for chunk in chunks:
            all_chunks.append((page_num, chunk))
    
    print(f"\n총 청크 수: {len(all_chunks)}")
    
    # 디버그: 첫 번째 청크 내용 확인
    if all_chunks:
        print(f"\n첫 번째 청크 내용 (처음 300자):")
        print(all_chunks[0][1][:300])
        print("...")
    
    # 배치 임베딩 & 업서트
    BATCH_SIZE = 64
    print("임베딩 생성 및 업서트 중...")
    
    for i in tqdm(range(0, len(all_chunks), BATCH_SIZE)):
        batch = all_chunks[i : i + BATCH_SIZE]
        embeddings = embed_batch([content for _, content in batch])
        
        for (page_num, content), embedding in zip(batch, embeddings):
            section = guess_section(content)
            insert_chunk(doc_name, section, page_num, content, embedding)
    
    print(f"완료! {len(all_chunks)}개 청크가 '{doc_name}'로 인덱싱되었습니다.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python scripts/index_pdf.py <pdf_path>")
        sys.exit(1)
    
    main(sys.argv[1])

