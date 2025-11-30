# 📖 상세 단계별 설정 가이드

새로운 회사를 위한 챗봇을 설정하는 전체 과정을 상세히 설명합니다.

---

## 🔧 사전 준비

### 필요한 계정
1. **Supabase** 계정 (https://supabase.com)
2. **OpenAI** 계정 (https://platform.openai.com)
3. **Vercel** 계정 (https://vercel.com) - 배포용
4. **GitHub** 계정 - 코드 저장용

### 필요한 정보 수집
새 회사로부터 받아야 할 정보:
- [ ] 회사명 (한글/영문)
- [ ] 회사 로고 URL 또는 파일
- [ ] 연락처 (이메일, 전화번호)
- [ ] 웹사이트 URL
- [ ] 챗봇에 넣을 PDF 파일들
- [ ] 자주 묻는 질문과 답변
- [ ] 외부 링크 목록 (논문 검색, 양식 다운로드 등)

---

## 📝 1단계: 환경변수 설정

### 1.1 Supabase 프로젝트 생성

1. https://supabase.com 로그인
2. "New Project" 클릭
3. 프로젝트 이름 입력 (예: `company-chatbot`)
4. 데이터베이스 비밀번호 설정
5. Region 선택 (Northeast Asia - Tokyo 권장)
6. "Create new project" 클릭

### 1.2 Supabase 키 확인

프로젝트 생성 후:
1. Settings → API 메뉴 이동
2. 다음 값들을 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE`

### 1.3 OpenAI API 키 발급

1. https://platform.openai.com/api-keys 접속
2. "Create new secret key" 클릭
3. 키 복사 → `OPENAI_API_KEY`

### 1.4 .env 파일 생성

프로젝트 루트에 `.env` 파일 생성:

```env
# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **중요**: `.env` 파일은 절대 Git에 커밋하지 마세요!

---

## 🗄️ 2단계: Supabase 테이블 생성

### 2.1 SQL Editor 접속

1. Supabase 대시보드에서 해당 프로젝트 선택
2. 왼쪽 메뉴에서 "SQL Editor" 클릭
3. "New query" 클릭

### 2.2 스키마 SQL 실행

`setup-template/supabase/schema.sql` 파일의 내용을 복사하여 실행합니다.

실행 순서:
1. **전체 SQL 복사** → SQL Editor에 붙여넣기
2. **"Run" 버튼 클릭**
3. 오류 없이 완료되면 성공

### 2.3 생성되는 테이블 목록

| 테이블명 | 용도 |
|----------|------|
| `rag_chunks` | PDF 텍스트 청크 및 임베딩 저장 |
| `kb_schedule` | 일정 정보 (FAQ) |
| `kb_fees` | 비용 정보 (FAQ) |
| `kb_membership` | 회원 정보 (FAQ) |
| `kb_submission` | 제출 정보 (FAQ) |
| `query_logs` | 질문 로그 |
| `unanswered_questions` | 미답변 질문 |
| `learned_answers` | 학습된 답변 |

---

## 🏢 3단계: 회사 정보 설정

### 3.1 company.json 수정

`config/company.json` 파일을 열어 수정합니다:

```json
{
  "name": "회사명",
  "nameEn": "Company Name",
  "description": "회사 설명 (챗봇 인사말에 사용)",
  "logo": "/logo.png",
  "primaryColor": "#0066CC",
  "secondaryColor": "#003366",
  "contact": {
    "email": "info@company.com",
    "phone": "02-1234-5678",
    "website": "https://company.com"
  },
  "chatbot": {
    "welcomeMessage": "안녕하세요! 무엇을 도와드릴까요?",
    "placeholder": "질문을 입력하세요...",
    "errorMessage": "죄송합니다. 오류가 발생했습니다."
  },
  "features": {
    "enableFaq": true,
    "enableRag": true,
    "enableLearning": true
  },
  "faqKeywords": {
    "schedule": ["일정", "날짜", "기간", "마감"],
    "fees": ["비용", "가격", "요금", "심사료"],
    "membership": ["회원", "가입", "등록"],
    "submission": ["제출", "투고", "신청"]
  }
}
```

### 3.2 주요 설정 항목 설명

| 항목 | 설명 | 예시 |
|------|------|------|
| `name` | 회사/기관 이름 | "한국IT정책경영학회" |
| `description` | 챗봇 소개 | "논문 투고 안내 챗봇" |
| `primaryColor` | 메인 색상 | "#0066CC" |
| `welcomeMessage` | 첫 인사말 | "안녕하세요!" |
| `faqKeywords` | FAQ 매칭 키워드 | 카테고리별 배열 |

### 3.3 로고 파일 추가

1. 회사 로고를 `public/logo.png`로 저장
2. 또는 외부 URL 사용: `"logo": "https://example.com/logo.png"`

---

## 🔗 4단계: 외부 링크 설정

### 4.1 external-links.json 수정

`config/external-links.json` 파일을 열어 수정합니다:

```json
{
  "links": [
    {
      "id": "main-site",
      "name": "공식 홈페이지",
      "url": "https://company.com",
      "keywords": ["홈페이지", "사이트", "웹사이트"],
      "description": "공식 홈페이지로 이동합니다."
    },
    {
      "id": "download-form",
      "name": "양식 다운로드",
      "url": "https://company.com/forms",
      "keywords": ["양식", "서식", "다운로드", "파일"],
      "description": "필요한 양식을 다운로드할 수 있습니다."
    }
  ]
}
```

### 4.2 링크 항목 설명

| 필드 | 필수 | 설명 |
|------|------|------|
| `id` | ✅ | 고유 식별자 |
| `name` | ✅ | 링크 표시 이름 |
| `url` | ✅ | 실제 URL |
| `keywords` | ✅ | 매칭될 키워드 배열 |
| `description` | ❌ | 링크 설명 |

### 4.3 키워드 설정 팁

- 사용자가 입력할 만한 다양한 표현 포함
- 예: "논문검색" → `["논문", "검색", "논문검색", "KCI", "학술"]`

---

## 📄 5단계: PDF 파일 추가

### 5.1 PDF 파일 준비

챗봇이 답변할 내용이 담긴 PDF 파일들을 준비합니다:
- 안내문
- 규정집
- FAQ 문서
- 양식 설명서 등

### 5.2 파일 저장 위치

```
프로젝트 루트/
└── data/
    ├── 회사안내.pdf
    ├── 규정집.pdf
    ├── FAQ.pdf
    └── ... (추가 PDF 파일들)
```

### 5.3 파일명 규칙

- 한글 파일명 사용 가능
- 공백 사용 가능
- 특수문자는 피하는 것이 좋음

---

## ⚙️ 6단계: PDF 인덱싱

### 6.1 Python 환경 준비

```bash
# scripts 폴더로 이동
cd scripts

# 패키지 설치
pip install -r requirements.txt
```

### 6.2 인덱싱 실행

```bash
# 모든 PDF 일괄 인덱싱
python index_all_pdfs.py
```

### 6.3 인덱싱 확인

```bash
# 결과 확인
python check_rag_chunks.py
```

예상 출력:
```
Total chunks: 145

Chunks per document:
  - 회사안내: 25 chunks
  - 규정집: 80 chunks
  - FAQ: 40 chunks
```

### 6.4 인덱싱 오류 시

1. `.env` 파일 확인 (API 키가 올바른지)
2. Supabase 테이블이 생성되었는지 확인
3. PDF 파일이 `data/` 폴더에 있는지 확인

---

## 🧪 7단계: 로컬 테스트

### 7.1 개발 서버 실행

```bash
# 프로젝트 루트에서
npm install
npm run dev
```

### 7.2 테스트 항목

브라우저에서 http://localhost:3000 접속 후:

- [ ] 챗봇 UI가 정상 표시되는지
- [ ] 회사 정보가 올바르게 표시되는지
- [ ] 외부 링크 질문 응답 확인
- [ ] FAQ 질문 응답 확인
- [ ] PDF 내용 질문 응답 확인
- [ ] 관리자 페이지 (/admin) 접근 가능한지

### 7.3 관리자 페이지 테스트

http://localhost:3000/admin 에서:
- 미답변 질문 목록 확인
- 답변 추가 기능 테스트
- 학습된 답변 목록 확인

---

## 🚀 8단계: Vercel 배포

### 8.1 GitHub 저장소 생성

```bash
# 새 저장소로 푸시
git init
git add .
git commit -m "Initial commit for [Company] chatbot"
git remote add origin https://github.com/username/company-chatbot.git
git push -u origin main
```

### 8.2 Vercel 프로젝트 생성

1. https://vercel.com 로그인
2. "Add New" → "Project"
3. GitHub 저장소 선택
4. 환경변수 설정:
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE`
5. "Deploy" 클릭

### 8.3 배포 확인

배포 완료 후 제공된 URL에서 챗봇이 정상 작동하는지 확인합니다.

---

## 📌 자주 발생하는 문제

### Q1: 챗봇이 "정보를 찾을 수 없습니다" 응답만 함
- PDF 인덱싱이 제대로 되었는지 확인
- `python check_rag_chunks.py`로 청크 수 확인
- 청크가 0개면 인덱싱 다시 실행

### Q2: 외부 링크가 작동하지 않음
- `config/external-links.json`의 키워드 확인
- 키워드가 질문에 포함되어야 매칭됨

### Q3: FAQ가 작동하지 않음
- Supabase에서 `kb_schedule`, `kb_fees` 등 테이블 확인
- 데이터가 있는지 확인

### Q4: 환경변수 오류
- `.env` 파일이 프로젝트 루트에 있는지 확인
- 키 값에 따옴표가 없는지 확인
- Vercel에도 환경변수가 설정되었는지 확인

---

## 📞 지원

문제 발생 시:
1. 이 문서의 "자주 발생하는 문제" 섹션 확인
2. `docs/` 폴더의 다른 가이드 문서 참조
3. GitHub Issues에 문의

