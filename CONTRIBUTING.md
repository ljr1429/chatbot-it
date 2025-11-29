# 기여 가이드

KITPM 투고 안내 챗봇 프로젝트에 기여해주셔서 감사합니다.

## 개발 환경 설정

### 1. 저장소 포크 및 클론
```bash
# 저장소 포크 (GitHub 웹 UI)
# 본인의 계정으로 포크 후

git clone https://github.com/<your-username>/kitpm-chatbot.git
cd kitpm-chatbot
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
cp .env.example .env.local
# .env.local 파일을 열어 키 입력
```

### 4. 개발 서버 실행
```bash
npm run dev
```

## 코딩 컨벤션

### TypeScript
- 타입은 명시적으로 선언 (any 사용 지양)
- 인터페이스보다 타입 별칭 선호
- 함수는 화살표 함수보다 일반 함수 선호 (컴포넌트 제외)

### React 컴포넌트
- 함수형 컴포넌트 사용
- Props는 인터페이스로 정의
- 파일명은 PascalCase (예: `ChatMessage.tsx`)

### 파일 구조
```
app/              # Next.js App Router 페이지
components/       # 재사용 가능한 컴포넌트
lib/              # 유틸리티 및 헬퍼 함수
supabase/         # 데이터베이스 스키마
scripts/          # Python 스크립트
```

## 커밋 메시지

다음 형식을 따라주세요:
```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 업데이트
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드/설정 변경
```

예시:
```bash
git commit -m "feat: KCI 링크에 툴팁 추가"
git commit -m "fix: 벡터 검색 임계값 조정"
```

## Pull Request 과정

### 1. 브랜치 생성
```bash
git checkout -b feature/your-feature-name
```

### 2. 변경사항 커밋
```bash
git add .
git commit -m "feat: your feature description"
```

### 3. 푸시 및 PR 생성
```bash
git push origin feature/your-feature-name
# GitHub에서 Pull Request 생성
```

### 4. PR 체크리스트
- [ ] 코드가 정상적으로 빌드되는가?
- [ ] 기존 기능이 정상 작동하는가?
- [ ] 새 기능에 대한 설명을 추가했는가?
- [ ] 관련 문서를 업데이트했는가?

## 테스트

### 로컬 테스트
```bash
# 빌드 테스트
npm run build

# 프로덕션 모드 실행
npm run start
```

### 수동 테스트 항목
1. FAQ 질문 테스트 (발간일정, 비용, 회원, 제출)
2. KCI 링크 테스트
3. RAG 검색 테스트
4. 반응형 레이아웃 확인 (모바일/태블릿/데스크톱)

## 이슈 리포팅

버그나 개선사항을 발견하면 GitHub Issues에 등록해주세요.

### 버그 리포트 템플릿
```
### 버그 설명
간단한 버그 설명

### 재현 방법
1. ...
2. ...

### 예상 동작
무엇이 일어나야 하는가?

### 실제 동작
무엇이 일어났는가?

### 환경
- OS: 
- 브라우저: 
```

## 질문이 있으신가요?

GitHub Discussions나 Issues를 활용해주세요.

감사합니다!

