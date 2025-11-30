# PDF 인덱싱 가이드

## 개요

이 문서는 챗봇이 PDF 문서 내용을 검색하고 답변할 수 있도록 PDF를 Supabase에 인덱싱하는 방법을 설명합니다.

## 현재 인덱싱 현황

| 문서명 | 청크 수 | 설명 |
|--------|---------|------|
| 1.(사)한국IT정책경영학회_입회원서 | 5 | 학회 입회원서 양식 |
| 25-17-03-00.한국IT정책경영학회 앞부문 | 42 | 학회지 앞부문 (목차, 편집위원 등) |
| 25-17-03한국IT정책경영학회 뒷부문 | 59 | 학회지 뒷부문 (논문 본문) |
| KITPM_2026년_논문_투고안내 | 4 | 2026년 논문 투고 안내 |
| [양식1]논문작성양식_202X-기수_이름 | 25 | 논문 작성 양식 템플릿 |
| [양식2-4]투고신청서 및 동의서 | 10 | 투고신청서 및 동의서 양식 |
| **총계** | **145** | |

*마지막 업데이트: 2025-11-30*

## 인덱싱 방법

### 1. 사전 준비

```bash
# scripts 폴더로 이동
cd scripts

# Python 패키지 설치
pip install -r requirements.txt
```

### 2. 환경변수 설정

프로젝트 루트에 `.env` 파일이 있어야 합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. PDF 인덱싱 실행

#### 모든 PDF 일괄 인덱싱

```bash
cd scripts
python index_all_pdfs.py
```

이 스크립트는 `data/` 폴더의 모든 PDF 파일을 자동으로 인덱싱합니다.

#### 개별 PDF 인덱싱

```bash
cd scripts
python index_pdf.py "../data/파일명.pdf"
```

### 4. 인덱싱 결과 확인

```bash
cd scripts
python check_rag_chunks.py
```

출력 예시:
```
Total chunks: 145

Chunks per document:
  - 1.(사)한국IT정책경영학회_입회원서: 5 chunks
  - KITPM_2026년_논문_투고안내: 4 chunks
  ...
```

## 스크립트 설명

| 스크립트 | 용도 |
|----------|------|
| `index_pdf.py` | 개별 PDF 파일 인덱싱 |
| `index_all_pdfs.py` | data/ 폴더의 모든 PDF 일괄 인덱싱 |
| `check_rag_chunks.py` | Supabase rag_chunks 테이블 현황 확인 |

## 청킹 설정

현재 설정:
- **청크 크기**: 500자
- **오버랩**: 100자
- **임베딩 모델**: `text-embedding-3-small`

## 새 PDF 추가 시

1. `data/` 폴더에 PDF 파일 추가
2. `python scripts/index_all_pdfs.py` 실행
3. `python scripts/check_rag_chunks.py`로 확인

## 주의사항

- PDF 파일은 `.gitignore`에 의해 Git에 포함되지 않습니다
- 인덱싱 데이터는 Supabase에 저장되므로 배포 환경에서도 동작합니다
- 동일한 문서를 다시 인덱싱하면 기존 데이터가 삭제되고 새로 저장됩니다

