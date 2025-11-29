# 상세 설정 가이드

이 문서는 챗봇 Template을 사용하여 회사별 챗봇을 구축하는 상세한 방법을 설명합니다.

---

## 📋 목차

1. [시작하기 전에](#시작하기-전에)
2. [Supabase 설정](#supabase-설정)
3. [OpenAI API 설정](#openai-api-설정)
4. [회사 정보 설정](#회사-정보-설정)
5. [PDF 문서 준비](#pdf-문서-준비)
6. [자동 설정 실행](#자동-설정-실행)
7. [테스트](#테스트)
8. [배포](#배포)

---

## 시작하기 전에

### 필요한 계정

- **Supabase 계정** (무료): https://supabase.com
- **OpenAI API 계정** (유료): https://platform.openai.com
- **Vercel 계정** (무료): https://vercel.com (배포용)

### 필요한 소프트웨어

- Node.js 18+ 
- Python 3.8+
- Git

---

## Supabase 설정

### 1. 프로젝트 생성

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. "New project" 클릭
3. 프로젝트 이름, 비밀번호, 리전 선택
4. "Create new project" 클릭 (2-3분 소요)

### 2. API Keys 확인

1. 프로젝트 설정 (Settings) → API로 이동
2. 다음 값을 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (⚠️ 비밀) → `SUPABASE_SERVICE_ROLE`

### 3. 스키마 실행

1. SQL Editor로 이동
2. 프로젝트의 `supabase/schema.sql` 파일을 열기
3. 전체 내용을 복사하여 SQL Editor에 붙여넣기
4. "Run" 클릭
5. 성공 메시지 확인

---

## OpenAI API 설정

### 1. API Key 발급

1. https://platform.openai.com/api-keys 접속
2. "Create new secret key" 클릭
3. 이름 입력 후 생성
4. **⚠️ 중요**: 생성된 키를 바로 복사 (다시 볼 수 없음)

### 2. 요금 설정 (권장)

1. https://platform.openai.com/account/billing/limits 접속
2. "Set usage limits" 설정
3. 월 최대 사용액 설정 (예: $20)

---

## 회사 정보 설정

### config/company.json 작성

```json
{
  "name": "ABC 컨설팅",
  "shortName": "ABC",
  "description": "IT 컨설팅 및 솔루션 제공",
  
  "contact": {
    "email": "contact@abc.com",
    "phone": "02-1234-5678",
    "website": "https://www.abc.com"
  },
  
  "branding": {
    "primaryColor": "#3B82F6",
    "logoUrl": "/logo.png",
    "faviconUrl": "/favicon.ico"
  },
  
  "chatbot": {
    "title": "ABC 컨설팅 챗봇",
    "welcomeMessage": "ABC 컨설팅에 오신 것을 환영합니다! 무엇을 도와드릴까요?",
    "placeholderText": "궁금한 점을 물어보세요...",
    "sampleQuestions": [
      "서비스 소개",
      "상담 신청 방법",
      "비용 안내",
      "연락처"
    ]
  },
  
  "features": {
    "enableExternalLinks": false,    // 외부 링크 기능 사용 안 함
    "enableQueryLogs": true,         // 질문 로그 저장
    "enableFAQ": false,              // FAQ 기능 사용 안 함
    "enableRAG": true                // RAG (문서 검색) 사용
  }
}
```

### 필수 필드

- `name`: 회사명 (필수)
- `contact.email`: 연락처 이메일 (필수)
- `chatbot.title`: 챗봇 제목 (필수)
- `chatbot.welcomeMessage`: 환영 메시지 (필수)
- `chatbot.sampleQuestions`: 예시 질문 배열 (필수)

---

## PDF 문서 준비

### 1. 문서 선정

챗봇이 답변할 수 있는 정보가 담긴 PDF 파일 준비:
- 제품/서비스 소개서
- 사용 가이드
- FAQ 문서
- 정책/약관
- 가격표 등

### 2. data/ 폴더에 복사

```bash
# Windows
copy C:\Documents\*.pdf data\

# Mac/Linux
cp ~/Documents/*.pdf data/
```

### 3. 파일명 권장사항

- 한글 파일명 가능
- 공백은 가능하면 언더스코어(_)로 대체
- 예: `서비스_소개서.pdf`, `FAQ_2024.pdf`

---

## 자동 설정 실행

### 1. 환경변수 설정

`.env` 파일 생성:

```bash
cp .env.example .env
```

편집:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE=eyJhb...

# OpenAI
OPENAI_API_KEY=sk-...
```

### 2. Python 패키지 설치

```bash
pip install -r scripts/requirements.txt
```

### 3. Setup 실행

```bash
npm run setup
```

**진행 과정:**
1. 환경변수 검증
2. company.json 검증
3. PDF 파일 확인
4. Supabase 스키마 실행 여부 확인
5. PDF 인덱싱 (각 PDF 처리 시간: 1-3분)
6. 완료 메시지

---

## 테스트

### 1. 로컬 서버 실행

```bash
npm run dev
```

### 2. 브라우저 테스트

http://localhost:3000 접속

**테스트 항목:**
- ✅ 챗봇 제목이 `config/company.json`의 설정대로 표시
- ✅ 샘플 질문 클릭 시 응답 생성
- ✅ PDF 내용 관련 질문에 정확한 답변
- ✅ 정보 없는 질문 시 연락처 안내

### 3. 디버깅

**응답이 안 나올 때:**

```bash
# 1. Supabase에 데이터가 있는지 확인
# Supabase Dashboard → Table Editor → rag_chunks 확인

# 2. 설정 검증
npm run validate-config

# 3. PDF 재인덱싱
npm run index-pdfs
```

**응답이 부정확할 때:**

`lib/constants.ts`에서 `RAG_SIMILARITY_THRESHOLD` 조정:

```typescript
RAG_SIMILARITY_THRESHOLD: 0.40,  // 0.45에서 낮춤
```

---

## 배포

### Vercel 배포

#### 1. GitHub에 Push

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-chatbot.git
git push -u origin main
```

#### 2. Vercel 연결

1. https://vercel.com/dashboard 접속
2. "New Project" 클릭
3. GitHub 저장소 선택
4. 환경변수 입력:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE`
   - `OPENAI_API_KEY`
5. "Deploy" 클릭

#### 3. 배포 완료

- URL 확인 (예: https://your-chatbot.vercel.app)
- 실제 환경에서 테스트

---

## 자주 묻는 질문

### Q: PDF가 많으면 시간이 오래 걸리나요?

A: 네. 10페이지 PDF 기준 약 2-3분 소요됩니다. 여러 PDF는 순차 처리됩니다.

### Q: 이미지가 많은 PDF는?

A: 텍스트만 추출됩니다. 이미지 내 텍스트는 OCR이 필요하므로 별도 처리가 필요합니다.

### Q: FAQ 기능은 어떻게 사용하나요?

A: `config/company.json`에서 `enableFAQ: true` 설정 후, Supabase에 `kb_*` 테이블을 생성하고 데이터를 입력해야 합니다. (선택사항)

### Q: 외부 링크 기능은?

A: `config/external-links.json` 파일을 생성하고 `enableExternalLinks: true` 설정하면 특정 키워드 질문 시 링크를 제공합니다.

### Q: 비용은 얼마나 드나요?

**OpenAI:**
- 임베딩: $0.00013 / 1K 토큰
- GPT-4o-mini: $0.150 / 1M 입력 토큰
- 예상: 월 100-200회 질문 → 약 $1-2

**Supabase:**
- 무료 플랜: 500MB DB, 5GB 트래픽 (충분)

**Vercel:**
- 무료 플랜: 충분

---

## 다음 단계

- [ ] 로고 변경 (`public/logo.png`)
- [ ] 브랜딩 색상 조정 (`tailwind.config.ts`)
- [ ] 도메인 연결 (Vercel Dashboard)
- [ ] 분석 도구 연결 (Google Analytics 등)

---

문제가 있으면 GitHub Issue를 등록해주세요!

