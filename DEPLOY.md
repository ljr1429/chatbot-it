# 배포 가이드

이 문서는 KITPM 투고 안내 챗봇을 GitHub, Supabase, Vercel에 배포하는 전체 과정을 단계별로 설명합니다.

## 전제 조건

다음 계정과 도구가 필요합니다:
- GitHub 계정
- Supabase 계정
- Vercel 계정
- OpenAI API 키 (유료, 크레딧 필요)
- Git 설치
- Node.js 18+ 설치
- Python 3.8+ 설치 (PDF 인덱싱용)

## 1단계: GitHub 저장소 생성

### 1-1. 저장소 생성
```bash
# GitHub에서 새 저장소 생성 (웹 UI 또는 CLI)
# 저장소명 예시: kitpm-chatbot

# 로컬 프로젝트를 Git으로 초기화
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/kitpm-chatbot.git
git push -u origin main
```

### 1-2. .gitignore 확인
`.gitignore`에 다음 항목이 포함되어 있는지 확인:
```
.env
.env.local
node_modules/
.next/
```

## 2단계: Supabase 설정

### 2-1. 프로젝트 생성
1. [Supabase](https://app.supabase.com) 로그인
2. "New project" 클릭
3. 프로젝트 정보 입력:
   - Name: `kitpm-chatbot`
   - Database Password: 강력한 비밀번호 (안전하게 보관)
   - Region: `Southeast Asia (Singapore)` 권장
4. "Create new project" 클릭 (약 2분 소요)

### 2-2. pgvector 확장 활성화
1. 프로젝트 대시보드 → Database → Extensions
2. 검색창에 "vector" 입력
3. "vector" 찾아서 "Enable" 클릭

### 2-3. 스키마 적용
1. 프로젝트 대시보드 → SQL Editor
2. "New query" 클릭
3. `supabase/schema.sql` 파일 내용 전체 복사
4. SQL Editor에 붙여넣기
5. "Run" 클릭 (약 5초 소요)
6. 성공 메시지 확인

### 2-4. 시드 데이터 입력
1. SQL Editor에서 "New query" 다시 클릭
2. `supabase/seed.sql` 파일 내용 복사
3. 붙여넣기 후 "Run" 클릭
4. 성공 메시지 확인

### 2-5. API 키 확인
1. 프로젝트 대시보드 → Settings → API
2. 다음 정보 복사 (메모장에 임시 저장):
   - Project URL (`https://xxxxx.supabase.co`)
   - anon public key (`eyJhbGc...`)
   - service_role key (`eyJhbGc...`)

**중요**: `service_role` 키는 절대 클라이언트에 노출하지 마세요!

### 2-6. RLS 정책 확인
1. 프로젝트 대시보드 → Authentication → Policies
2. 다음 테이블의 정책이 활성화되었는지 확인:
   - `kb_schedule`, `kb_fees`, `kb_membership`, `kb_submission`, `rag_chunks`
   - 각 테이블마다 "anon read" 정책이 있어야 함

## 3단계: OpenAI API 키 발급

### 3-1. OpenAI 가입 및 크레딧 충전
1. [OpenAI Platform](https://platform.openai.com) 로그인
2. Settings → Billing → Add payment method
3. 최소 $5 이상 충전 권장

### 3-2. API 키 생성
1. API keys → Create new secret key
2. Name: `KITPM Chatbot`
3. 키 복사 (`sk-...`) 후 안전하게 보관
   - **주의**: 이 키는 다시 확인할 수 없으므로 반드시 복사!

## 4단계: PDF 인덱싱 (로컬에서 실행)

### 4-1. Python 환경 설정
```bash
# 프로젝트 루트에서
cd scripts
pip install -r requirements.txt
```

### 4-2. 환경 변수 설정
프로젝트 루트에 `.env` 파일 생성:
```bash
# 프로젝트 루트로 이동
cd ..

# .env 파일 생성 (Windows는 메모장 사용)
cat > .env << EOF
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGc...
EOF
```

### 4-3. PDF 인덱싱 실행
```bash
# data/ 폴더에 PDF 파일이 있는지 확인
ls data/KITPM_2026년_논문_투고안내.pdf

# 인덱싱 실행
python scripts/index_pdf.py data/KITPM_2026년_논문_투고안내.pdf
```

예상 소요 시간: 약 2-5분 (PDF 크기에 따라)

### 4-4. 인덱싱 확인
1. Supabase 대시보드 → Table Editor → `rag_chunks`
2. 데이터가 추가되었는지 확인 (수십~수백 행)

## 5단계: Vercel 배포

### 5-1. Vercel 가입 및 GitHub 연동
1. [Vercel](https://vercel.com) 로그인
2. "Continue with GitHub" 클릭하여 연동

### 5-2. 프로젝트 Import
1. Vercel 대시보드 → "Add New" → "Project"
2. GitHub 저장소 목록에서 `kitpm-chatbot` 선택
3. "Import" 클릭

### 5-3. 환경 변수 설정
프로젝트 설정 화면에서:
1. "Environment Variables" 섹션 펼치기
2. 다음 변수 추가 (Name / Value):

```
OPENAI_API_KEY
sk-...

NEXT_PUBLIC_SUPABASE_URL
https://xxxxx.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGc... (anon key)

SUPABASE_SERVICE_ROLE
eyJhbGc... (service_role key)
```

3. 각 변수마다 "Add" 클릭

### 5-4. 배포 시작
1. "Deploy" 버튼 클릭
2. 빌드 로그 확인 (약 2-3분 소요)
3. 성공 시 "Visit" 버튼 클릭하여 사이트 확인

### 5-5. 도메인 설정 (선택)
1. 프로젝트 대시보드 → Settings → Domains
2. 원하는 도메인 추가 (예: `kitpm-chatbot.vercel.app`)

## 6단계: 동작 테스트

### 6-1. 배포된 사이트 접속
`https://your-project.vercel.app` 접속

### 6-2. 기능 테스트
다음 질문들을 입력하여 각 기능 테스트:

**정형 FAQ 테스트:**
- "발간 일정은 언제인가요?"
- "급행 심사 비용은 얼마인가요?"
- "회원 가입은 어떻게 하나요?"
- "투고 양식은 어디서 받나요?"

**KCI 안내 테스트:**
- "KCI에서 논문 검색하는 방법"
- "인용 통계는 어디서 보나요?"

**RAG 검색 테스트:**
- "심사 기간은 얼마나 걸리나요?"
- "중복 게재는 허용되나요?"

### 6-3. 응답 확인사항
- 답변이 한국어로 정확하게 나오는지
- 출처(citations)가 표시되는지
- KCI 링크가 제대로 작동하는지

## 7단계: 자동 배포 설정 (GitHub → Vercel)

Vercel은 GitHub 저장소와 연동되면 자동으로:
- `main` 브랜치에 푸시할 때마다 프로덕션 배포
- PR 생성 시 프리뷰 배포 생성

별도 설정 불필요!

## 8단계: 모니터링

### Vercel 대시보드
- Analytics: 방문자 수, 응답 시간
- Logs: 에러 로그 확인 (Deployments → 최신 배포 → Runtime Logs)

### OpenAI 대시보드
- Usage: API 사용량 및 비용 모니터링
- [https://platform.openai.com/usage](https://platform.openai.com/usage)

### Supabase 대시보드
- Database: 테이블 데이터 확인
- Logs: SQL 쿼리 로그

## 문제 해결

### 빌드 실패
- Vercel 로그에서 에러 메시지 확인
- 환경 변수가 모두 설정되었는지 확인
- `package.json`의 의존성 버전 확인

### API 호출 오류
- 브라우저 개발자 도구 (F12) → Network 탭에서 `/api/ask` 요청 확인
- Vercel Functions 로그 확인

### 벡터 검색 결과 없음
- Supabase `rag_chunks` 테이블에 데이터가 있는지 확인
- `match_chunks` 함수가 생성되었는지 확인 (SQL Editor에서 테스트)

### OpenAI API 할당량 초과
- OpenAI 대시보드에서 크레딧 잔액 확인
- Usage limits 설정 (예: 월 $10 제한)

## 유지보수 가이드

### 연도별 PDF 업데이트
```bash
# 새 PDF 다운로드 후
python scripts/index_pdf.py data/KITPM_2027년_논문_투고안내.pdf

# Supabase Table Editor에서 kb_* 테이블 직접 수정
```

### FAQ 데이터 수정
Supabase 대시보드 → Table Editor → 해당 테이블 직접 편집

### 코드 수정 후 배포
```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel이 자동으로 재배포
```

## 비용 예상

### 무료 티어 범위
- **Vercel**: 월 100GB 대역폭, 10만 함수 호출 (초과 시 $20/월)
- **Supabase**: 월 500MB 데이터베이스, 2GB 파일 저장 (초과 시 $25/월)

### OpenAI 비용 (유료)
- 임베딩 (text-embedding-3-small): $0.02 / 1M 토큰
- 채팅 (gpt-4o-mini): $0.15 / 1M input tokens, $0.6 / 1M output tokens
- 예상 월 비용: 약 $5-20 (사용량에 따라)

**총 예상 비용**: 월 $5-20 (무료 티어 내에서 사용 시)

## 완료!

배포가 성공적으로 완료되었습니다. 이제 사용자들이 접속하여 챗봇을 이용할 수 있습니다.

추가 질문이나 문제가 있으면 GitHub Issues를 활용하세요.

