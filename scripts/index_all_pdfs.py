# scripts/index_all_pdfs.py
# data 폴더의 모든 PDF를 인덱싱

import os
import sys
from pathlib import Path

# 프로젝트 루트로 이동
script_dir = Path(__file__).parent
project_root = script_dir.parent
os.chdir(project_root)

# 환경변수 로드
from dotenv import load_dotenv
load_dotenv('.env')

# 필수 환경변수 확인
url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE')
openai_key = os.getenv('OPENAI_API_KEY')

if not all([url, key, openai_key]):
    print("Error: Environment variables not set!")
    print(f"  NEXT_PUBLIC_SUPABASE_URL: {'OK' if url else 'MISSING'}")
    print(f"  SUPABASE_SERVICE_ROLE: {'OK' if key else 'MISSING'}")
    print(f"  OPENAI_API_KEY: {'OK' if openai_key else 'MISSING'}")
    sys.exit(1)

# 라이브러리 임포트
from supabase import create_client
from openai import OpenAI
from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextContainer
from tqdm import tqdm

# 클라이언트 초기화
supabase = create_client(url, key)
openai = OpenAI(api_key=openai_key)

def extract_text_from_pdf(pdf_path):
    """PDF에서 텍스트 추출"""
    pages = []
    try:
        for page_num, page_layout in enumerate(extract_pages(pdf_path), start=1):
            text = ""
            for element in page_layout:
                if isinstance(element, LTTextContainer):
                    text += element.get_text()
            if text.strip():
                pages.append((page_num, text.strip()))
    except Exception as e:
        print(f"  Error extracting {pdf_path}: {e}")
    return pages

def chunk_text(text, chunk_size=500, overlap=100):
    """텍스트를 청크로 분할"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk.strip())
        start = end - overlap
    return chunks

def index_pdf(pdf_path):
    """PDF를 인덱싱하여 Supabase에 저장"""
    doc_name = Path(pdf_path).stem
    print(f"\n=== Indexing: {doc_name} ===")
    
    # 텍스트 추출
    pages = extract_text_from_pdf(pdf_path)
    print(f"  Pages extracted: {len(pages)}")
    
    if not pages:
        print("  No text found, skipping...")
        return 0
    
    # 청킹 및 임베딩
    all_chunks = []
    for page_num, text in pages:
        chunks = chunk_text(text)
        for chunk in chunks:
            all_chunks.append((page_num, chunk))
    
    print(f"  Total chunks: {len(all_chunks)}")
    
    if not all_chunks:
        return 0
    
    # 기존 데이터 삭제
    supabase.table('rag_chunks').delete().eq('doc_name', doc_name).execute()
    
    # 임베딩 생성 및 저장
    for page_num, chunk in tqdm(all_chunks, desc="  Embedding"):
        try:
            response = openai.embeddings.create(
                model="text-embedding-3-small",
                input=chunk
            )
            embedding = response.data[0].embedding
            vec_string = f"[{','.join(map(str, embedding))}]"
            
            supabase.table('rag_chunks').insert({
                'doc_name': doc_name,
                'section': '',
                'page': page_num,
                'content': chunk,
                'embedding': vec_string
            }).execute()
        except Exception as e:
            print(f"  Error: {e}")
    
    print(f"  Done: {len(all_chunks)} chunks saved")
    return len(all_chunks)

def main():
    data_dir = project_root / 'data'
    pdf_files = list(data_dir.glob('*.pdf'))
    
    print(f"Found {len(pdf_files)} PDF files in data/")
    
    total_chunks = 0
    for pdf_path in pdf_files:
        chunks = index_pdf(pdf_path)
        total_chunks += chunks
    
    print(f"\n=== COMPLETE ===")
    print(f"Total chunks indexed: {total_chunks}")

if __name__ == "__main__":
    main()

