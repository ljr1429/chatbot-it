# 🤖 AI Chatbot Template

회사별 문서(PDF)를 기반으로 커스텀 챗봇을 빠르게 구축하는 **Next.js + Supabase + OpenAI** 템플릿

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 📄 **PDF 기반 RAG** | 회사 문서를 벡터화하여 정확한 답변 생성 |
| 🧠 **학습형 챗봇** | 답변 못한 질문을 관리자가 학습시키면 다음부터 자동 답변 |
| ⚙️ **설정 파일 기반** | `config/` 폴더로 회사 정보 손쉽게 관리 |
| 💬 **FAQ + RAG 하이브리드** | 정형 데이터와 벡터 검색 결합 |
| 🔗 **외부 링크 지원** | 관련 웹사이트로 자동 연결 (선택사항) |
| 🛠️ **관리자 페이지** | 미답변 질문 확인 및 답변 추가 (`/admin`) |

---

## 🚀 빠른 시작 (5분)

### 1. 프로젝트 복사

```bash
git clone https://github.com/your-org/chatbot-template.git my-chatbot
cd my-chatbot
npm install
```

### 2. 환경변수 설정

```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일 편집:

```env
# Supabase (https://app.supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE=your-service-role-key

# OpenAI (https://platform.openai.com)
OPENAI_API_KEY=sk-your-openai-key
```

### 3. 회사 정보 설정

`config/company.json` 편집:

```json
{
  "name": "우리 회사",
  "contact": {
    "email": "contact@company.com",
    "phone": "02-1234-5678"
  },
  "chatbot": {
    "title": "우리 회사 챗봇",
    "welcomeMessage": "안녕하세요! 무엇을 도와드릴까요?",
    "sampleQuestions": ["서비스 소개", "비용 안내", "문의 방법"]
  }
}
```

### 4. Supabase 설정

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 새 프로젝트 생성
3. **SQL Editor**에서 `supabase/schema.sql` 실행

### 5. PDF 추가 & 인덱싱

```bash
# data/ 폴더에 PDF 복사
cp /path/to/your/*.pdf data/

# Python 패키지 설치
pip install -r scripts/requirements.txt

# PDF 인덱싱
npm run index-pdfs
```

### 6. 로컬 테스트

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 7. 배포

```bash
# Vercel 배포
vercel deploy --prod
```

---

## 📂 프로젝트 구조

```
chatbot-template/
├── config/                    # ⚙️ 회사별 설정 (수정 필요)
│   ├── company.json           # 회사 정보
│   └── external-links.json    # 외부 URL (선택)
│
├── data/                      # 📄 PDF 파일 (추가 필요)
│   └── (여기에 회사 PDF 추가)
│
├── app/                       # Next.js 앱
│   ├── page.tsx               # 메인 챗봇 페이지
│   ├── admin/page.tsx         # 🛠️ 관리자 페이지
│   └── api/
│       ├── ask/route.ts       # 챗봇 API
│       └── admin/             # 관리자 API
│
├── components/                # React 컴포넌트
│   ├── ChatContainer.tsx
│   ├── ChatMessage.tsx
│   └── ChatInput.tsx
│
├── lib/                       # 유틸리티
│   ├── config.ts              # 설정 로더
│   ├── supabase.ts            # Supabase 클라이언트
│   └── constants.ts           # RAG 설정
│
├── scripts/                   # 자동화 스크립트
│   ├── index_pdf.py           # PDF 인덱싱
│   └── requirements.txt       # Python 의존성
│
├── supabase/
│   ├── schema.sql             # DB 스키마
│   └── seed.sql               # 샘플 데이터
│
└── docs/                      # 📚 문서
    ├── NEW_COMPANY_SETUP.md   # 새 회사 설정 가이드
    ├── FAQ_KEYWORDS_GUIDE.md  # FAQ 키워드 설정
    └── LEARNING_CHATBOT_GUIDE.md  # 학습형 챗봇 가이드
```

---

## 🛠️ 관리자 페이지 (`/admin`)

챗봇이 답변하지 못한 질문을 관리하고 학습시킬 수 있습니다.

### 기능

| 기능 | 설명 |
|------|------|
| **미답변 질문 확인** | 챗봇이 답변 못한 질문 목록 |
| **답변 추가** | 미답변 질문에 답변 입력 → 자동 학습 |
| **직접 입력** | 새로운 질문-답변 쌍 직접 추가 |
| **활성화/비활성화** | 학습된 답변 on/off |
| **삭제** | 불필요한 데이터 삭제 |

### 접속 방법

```
로컬: http://localhost:3000/admin
배포: https://your-domain.com/admin
```

---

## 📋 사용 가능한 명령어

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 전체 셋업
npm run setup

# 설정 검증
npm run validate-config

# PDF 인덱싱
npm run index-pdfs
```

---

## 🔄 업데이트

### PDF 추가/변경

```bash
# 1. data/ 폴더에 PDF 추가
cp new-doc.pdf data/

# 2. 재인덱싱
npm run index-pdfs
```

### 회사 정보 변경

```bash
# 1. config/company.json 수정
# 2. 서버 재시작 (자동 적용)
npm run dev
```

---

## ⚙️ 고급 설정

### RAG 파라미터 조정

`lib/constants.ts`:

```typescript
export const CHATBOT_CONFIG = {
  RAG_MATCH_COUNT: 5,           // 검색 결과 개수
  RAG_SIMILARITY_THRESHOLD: 0.45, // 유사도 임계값 (0.3~0.7)
}
```

### FAQ 키워드 추가

`config/company.json`:

```json
{
  "faqKeywords": {
    "fees": ["비용", "가격", "심사비", "심사료"],
    "schedule": ["일정", "스케줄", "언제"]
  }
}
```

---

## 📚 상세 문서

| 문서 | 설명 |
|------|------|
| [NEW_COMPANY_SETUP.md](./docs/NEW_COMPANY_SETUP.md) | 새 회사 챗봇 만들기 (필독!) |
| [LEARNING_CHATBOT_GUIDE.md](./docs/LEARNING_CHATBOT_GUIDE.md) | 학습형 챗봇 관리 |
| [FAQ_KEYWORDS_GUIDE.md](./docs/FAQ_KEYWORDS_GUIDE.md) | FAQ 키워드 설정 |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | 초기 설정 상세 |
| [DEPLOY.md](./DEPLOY.md) | Vercel 배포 가이드 |

---

## 🐛 문제 해결

### PDF 인덱싱 실패

```bash
# Python 패키지 재설치
pip install -r scripts/requirements.txt

# 개별 PDF 테스트
python scripts/index_pdf.py data/yourfile.pdf
```

### 답변이 나오지 않음

1. Supabase `rag_chunks` 테이블에 데이터 확인
2. `npm run validate-config`로 설정 검증
3. `lib/constants.ts`의 `RAG_SIMILARITY_THRESHOLD` 낮추기 (0.45 → 0.35)

### 환경변수 오류

```bash
# .env 파일 확인
cat .env

# 필수 변수: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, 
#           SUPABASE_SERVICE_ROLE, OPENAI_API_KEY
```

---

## 📄 라이선스

MIT License

---

## 💬 문의

문제가 있으시면 [Issue](https://github.com/your-org/chatbot-template/issues)를 등록해주세요.
