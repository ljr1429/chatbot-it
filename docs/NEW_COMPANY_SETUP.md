# 🏢 새 회사 챗봇 만들기 - 완벽 가이드

이 문서는 **기존 Template을 새로운 회사로 변경**하는 전체 과정을 단계별로 안내합니다.

> 💡 **예시**: KITPM 학회 챗봇 → ABC 컨설팅 챗봇으로 변경

---

## 📋 체크리스트

- [ ] 1. 환경변수 설정 (`.env`)
- [ ] 2. 회사 정보 수정 (`config/company.json`)
- [ ] 3. 외부 링크 설정 (선택, `config/external-links.json`)
- [ ] 4. PDF 파일 교체 (`data/` 폴더)
- [ ] 5. Supabase 스키마 실행
- [ ] 6. FAQ 데이터 수정 (선택, `supabase/seed.sql`)
- [ ] 7. PDF 인덱싱 실행
- [ ] 8. 로컬 테스트
- [ ] 9. 배포

---

## 📝 상세 단계

### 1️⃣ 환경변수 설정 (`.env`)

**위치**: 프로젝트 루트 `/`

**작업**: `.env` 파일 생성 또는 수정

```bash
# Supabase (새 회사용 Supabase 프로젝트 생성 후)
NEXT_PUBLIC_SUPABASE_URL=https://새회사프로젝트.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=새회사_anon_key
SUPABASE_SERVICE_ROLE=새회사_service_role_key

# OpenAI (기존 키 재사용 가능)
OPENAI_API_KEY=sk-your-openai-key
```

**필수 작업**:
- [ ] Supabase 새 프로젝트 생성
- [ ] Supabase URL, ANON_KEY, SERVICE_ROLE 복사
- [ ] `.env` 파일에 붙여넣기

**참고**: [SETUP_GUIDE.md - Supabase 설정](../SETUP_GUIDE.md#supabase-설정)

---

### 2️⃣ 회사 정보 수정 (`config/company.json`)

**위치**: `/config/company.json`

**작업**: 회사 정보를 새 회사로 변경

#### 필수 수정 항목 ✅

```json
{
  "name": "ABC 컨설팅",              // ← 회사명
  "shortName": "ABC",                 // ← 약어
  "description": "IT 컨설팅 전문 기업",  // ← 설명
  
  "contact": {
    "email": "contact@abc.com",      // ← 이메일 (필수!)
    "phone": "02-1234-5678",         // ← 전화번호
    "website": "https://www.abc.com" // ← 웹사이트
  },
  
  "chatbot": {
    "title": "ABC 컨설팅 챗봇",       // ← 챗봇 제목 (필수!)
    "welcomeMessage": "ABC 컨설팅에 오신 것을 환영합니다!",  // ← 환영 메시지 (필수!)
    "placeholderText": "궁금한 점을 물어보세요...",
    "sampleQuestions": [             // ← 예시 질문 (필수!)
      "서비스 소개",
      "상담 신청 방법",
      "비용 안내",
      "연락처"
    ]
  }
}
```

#### 선택 수정 항목 ⚙️

```json
{
  "features": {
    "enableExternalLinks": false,    // KCI 같은 외부 링크 사용 안 함
    "enableQueryLogs": true,         // 질문 로그 저장
    "enableFAQ": false,              // FAQ 테이블 사용 안 함
    "enableRAG": true                // PDF 검색만 사용
  },
  
  "faqKeywords": {
    // FAQ 사용 시에만 설정
    "fees": ["비용", "가격", "요금"],
    "schedule": ["일정", "시간"],
    "membership": ["회원", "가입"],
    "submission": ["신청", "접수"]
  }
}
```

**필수 작업**:
- [ ] `name`, `contact.email` 변경
- [ ] `chatbot.title`, `welcomeMessage` 변경
- [ ] `sampleQuestions` 회사에 맞게 수정

**참고**: [README.md - 설정 파일 상세](../README.md#설정-파일-상세)

---

### 3️⃣ 외부 링크 설정 (선택)

**위치**: `/config/external-links.json`

**작업**: KCI 같은 외부 링크가 필요한 경우에만 설정

#### Case 1: 외부 링크 사용 안 함 (권장)

```json
{
  "enabled": false
}
```

또는 파일 자체를 삭제해도 됩니다.

#### Case 2: 외부 링크 사용

```json
{
  "enabled": true,
  "keywords": ["고객센터", "지원", "문의"],
  
  "links": {
    "고객센터": "https://abc.com/support",
    "FAQ": "https://abc.com/faq"
  },
  
  "autoMatch": [
    {
      "keywords": ["고객", "지원"],
      "links": ["고객센터"]
    }
  ]
}
```

**필수 작업**:
- [ ] 외부 링크 필요 여부 결정
- [ ] 필요하면 링크 URL 수정
- [ ] 불필요하면 `enabled: false` 설정

---

### 4️⃣ PDF 파일 교체 (`data/` 폴더)

**위치**: `/data/`

**작업**: 기존 KITPM PDF를 삭제하고 새 회사 PDF 추가

```bash
# Windows PowerShell
# 1. 기존 PDF 삭제
Remove-Item data\*.pdf

# 2. 새 회사 PDF 복사
Copy-Item C:\Documents\ABC회사\*.pdf data\

# Mac/Linux
# 1. 기존 PDF 삭제
rm data/*.pdf

# 2. 새 회사 PDF 복사
cp ~/Documents/ABC회사/*.pdf data/
```

**권장 PDF 종류**:
- 서비스 소개서
- 제품 카탈로그
- 사용 가이드
- FAQ 문서
- 가격표
- 정책/약관

**필수 작업**:
- [ ] 기존 KITPM PDF 삭제
- [ ] 새 회사 PDF 복사 (최소 1개)
- [ ] PDF 파일명 확인 (한글 가능)

**참고**: [SETUP_GUIDE.md - PDF 문서 준비](../SETUP_GUIDE.md#pdf-문서-준비)

---

### 5️⃣ Supabase 스키마 실행

**위치**: `/supabase/schema.sql`

**작업**: Supabase에서 테이블 생성

#### 방법 1: Supabase Dashboard 사용 (권장)

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 새 회사용 프로젝트 선택
3. **SQL Editor** 메뉴 클릭
4. 프로젝트의 `supabase/schema.sql` 파일 열기
5. **전체 내용 복사** (Ctrl+A → Ctrl+C)
6. SQL Editor에 **붙여넣기**
7. **Run** 버튼 클릭
8. 성공 메시지 확인

#### 방법 2: 로컬 Supabase CLI (고급)

```bash
supabase db push
```

**필수 작업**:
- [ ] `schema.sql` 실행
- [ ] 테이블 생성 확인 (Table Editor에서 `rag_chunks` 테이블 확인)

**에러 해결**:
- "already exists" 에러 → 무시해도 됨 (기존 테이블)
- "policy already exists" → 무시해도 됨

---

### 6️⃣ FAQ 데이터 수정 (선택)

**위치**: `/supabase/seed.sql`

**작업**: FAQ 기능을 사용하는 경우에만 수정

#### Case 1: FAQ 기능 사용 안 함 (권장)

`config/company.json`에서:
```json
"features": {
  "enableFAQ": false
}
```

이 경우 `seed.sql` 수정 불필요 ✅

#### Case 2: FAQ 기능 사용

`supabase/seed.sql` 편집:

```sql
-- 기존 KITPM 데이터 삭제
DELETE FROM kb_fees;
DELETE FROM kb_schedule;
DELETE FROM kb_membership;
DELETE FROM kb_submission;

-- 새 회사 데이터 입력
INSERT INTO kb_fees (type, review_fee_krw, publication_fee_krw) VALUES
  ('일반', 50000, 100000),
  ('급행', 100000, 150000);

-- ... 나머지 테이블도 수정
```

Supabase SQL Editor에서 실행

**필수 작업** (FAQ 사용 시):
- [ ] `seed.sql` 편집
- [ ] Supabase SQL Editor에서 실행
- [ ] Table Editor에서 데이터 확인

**참고**: 대부분의 경우 **FAQ 없이 RAG만** 사용하는 것을 권장합니다!

---

### 7️⃣ PDF 인덱싱 실행

**위치**: 프로젝트 루트

**작업**: PDF를 벡터화하여 Supabase에 저장

#### 자동 인덱싱 (권장)

```bash
npm run setup
```

또는

```bash
npm run index-pdfs
```

#### 개별 PDF 인덱싱

```bash
python scripts/index_pdf.py data/ABC회사소개서.pdf
```

**진행 시간**: PDF 10페이지당 약 2-3분

**필수 작업**:
- [ ] PDF 인덱싱 실행
- [ ] 콘솔에서 "✅ 완료" 메시지 확인
- [ ] Supabase Table Editor에서 `rag_chunks` 테이블에 데이터 확인

**에러 해결**:
```bash
# ModuleNotFoundError 발생 시
pip install -r scripts/requirements.txt

# 환경변수 오류 시
# .env 파일 확인
```

---

### 8️⃣ 로컬 테스트

**작업**: 챗봇이 제대로 작동하는지 확인

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

#### 테스트 항목 ✅

**UI 확인**:
- [ ] 챗봇 제목이 새 회사명으로 표시됨
- [ ] 환영 메시지가 올바르게 표시됨
- [ ] 샘플 질문이 회사에 맞게 표시됨

**기능 확인**:
- [ ] 샘플 질문 클릭 시 응답 생성
- [ ] PDF 내용 관련 질문에 정확한 답변
- [ ] 인용(Citations) 표시 확인
- [ ] 정보 없는 질문 시 연락처 안내

**테스트 질문 예시**:
1. "서비스 소개해주세요" (PDF 내용)
2. "비용은 얼마인가요?" (PDF 내용)
3. "연락처 알려주세요" (config 정보)
4. "우주여행 방법은?" (없는 정보 → 연락처 안내)

---

### 9️⃣ 배포

**작업**: Vercel에 배포

#### 9-1. GitHub에 Push

```bash
git add .
git commit -m "feat: ABC 컨설팅 챗봇 설정 완료"
git push origin main
```

#### 9-2. Vercel 배포

**방법 1: Vercel Dashboard 사용**

1. https://vercel.com/dashboard 접속
2. "New Project" 클릭
3. GitHub 저장소 선택
4. **Environment Variables** 입력:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE=...
   OPENAI_API_KEY=...
   ```
5. "Deploy" 클릭
6. 배포 완료 후 URL 확인

**방법 2: Vercel CLI 사용**

```bash
vercel deploy --prod
```

**필수 작업**:
- [ ] GitHub에 Push
- [ ] Vercel 환경변수 설정
- [ ] 배포 성공 확인
- [ ] 배포된 URL에서 테스트

**참고**: [DEPLOY.md](../DEPLOY.md)

---

## 📂 수정 파일 요약

| 파일 | 필수 여부 | 작업 |
|------|----------|------|
| `.env` | ✅ 필수 | Supabase/OpenAI API 키 입력 |
| `config/company.json` | ✅ 필수 | 회사 정보, 챗봇 설정 |
| `config/external-links.json` | ⚪ 선택 | 외부 링크 (대부분 불필요) |
| `data/*.pdf` | ✅ 필수 | 기존 PDF 삭제, 새 PDF 추가 |
| `supabase/schema.sql` | ✅ 필수 | Supabase에서 실행 (1회만) |
| `supabase/seed.sql` | ⚪ 선택 | FAQ 사용 시만 수정 |

---

## 🚫 수정하지 않아도 되는 파일

다음 파일들은 **수정 불필요**:
- `app/` 폴더 (코드)
- `components/` 폴더 (코드)
- `lib/` 폴더 (코드)
- `scripts/` 폴더 (스크립트)
- `package.json`
- `next.config.js`
- `tailwind.config.ts`

---

## ⏱️ 예상 소요 시간

| 단계 | 시간 |
|------|------|
| 환경변수 설정 | 5분 |
| company.json 수정 | 5분 |
| PDF 준비 | 10분 |
| Supabase 설정 | 10분 |
| PDF 인덱싱 | 10-30분 (PDF 수량에 따라) |
| 테스트 | 10분 |
| 배포 | 10분 |
| **총 시간** | **약 1시간** |

---

## 🐛 문제 해결

### PDF 인덱싱 실패

```bash
# Python 패키지 재설치
pip install -r scripts/requirements.txt

# 개별 PDF 테스트
python scripts/index_pdf.py data/파일명.pdf
```

### 답변이 나오지 않음

```bash
# 1. Supabase 데이터 확인
# Table Editor → rag_chunks 테이블에 데이터 있는지 확인

# 2. 설정 검증
npm run validate-config

# 3. PDF 재인덱싱
npm run index-pdfs
```

### 환경변수 오류

```bash
# .env 파일 위치 확인 (프로젝트 루트)
ls -la .env

# .env 내용 확인
cat .env
```

---

## 📚 관련 문서

- [README.md](../README.md) - 전체 프로젝트 가이드
- [SETUP_GUIDE.md](../SETUP_GUIDE.md) - 초기 설정 상세 가이드
- [FAQ_KEYWORDS_GUIDE.md](./FAQ_KEYWORDS_GUIDE.md) - FAQ 키워드 설정
- [DEPLOY.md](../DEPLOY.md) - Vercel 배포 가이드

---

## 💡 빠른 참고

### 최소 설정 (3개 파일만 수정)

새 회사 챗봇을 만들기 위한 **필수 최소 작업**:

```bash
1. .env 파일 생성 (Supabase + OpenAI)
2. config/company.json 수정 (회사 정보)
3. data/ 폴더에 PDF 추가
```

그 다음:
```bash
npm run setup   # 자동 설정
npm run dev     # 테스트
```

---

## ✅ 최종 체크리스트

배포 전 마지막 확인:

- [ ] `.env` 파일에 모든 키 입력됨
- [ ] `config/company.json`에 회사 정보 정확히 입력됨
- [ ] `data/` 폴더에 새 회사 PDF만 있음 (기존 PDF 삭제)
- [ ] Supabase `rag_chunks` 테이블에 데이터 있음
- [ ] 로컬 테스트 완료 (http://localhost:3000)
- [ ] 여러 질문으로 답변 테스트 완료
- [ ] 정보 없는 질문 시 연락처 안내 확인
- [ ] GitHub에 Push 완료
- [ ] Vercel 배포 완료
- [ ] 배포된 URL에서 최종 테스트 완료

---

궁금한 점이 있으면 GitHub Issue를 등록해주세요!

