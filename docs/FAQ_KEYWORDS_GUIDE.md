# FAQ 키워드 커스터마이징 가이드

이 문서는 `config/company.json`의 `faqKeywords` 설정을 통해 FAQ 질문 인식을 개선하는 방법을 설명합니다.

---

## 🤔 문제 상황

사용자가 "급행심사**비**"로 질문하면 답변을 잘 하는데, "급행심사**료**"로 질문하면 답변을 못하는 경우

➡️ **원인**: 키워드 매칭 문제

---

## ✅ 해결 방법: faqKeywords 설정

### 1. config/company.json 편집

```json
{
  "features": {
    "enableFAQ": true
  },
  
  "faqKeywords": {
    "fees": [
      "비용", 
      "심사비", 
      "심사료",      // ← 추가!
      "게재료",
      "게재비",      // ← 추가!
      "금액",
      "요금"
    ],
    "schedule": [
      "발간", 
      "일정", 
      "스케줄", 
      "언제"
    ],
    "membership": [
      "회원", 
      "정회원", 
      "가입", 
      "회비",
      "입회"
    ],
    "submission": [
      "제출", 
      "양식", 
      "메일", 
      "이메일",
      "제목", 
      "투고"
    ]
  }
}
```

### 2. 변경 사항 적용

```bash
# 서버 재시작 (자동 적용)
npm run dev
```

**끝!** 이제 "심사료"로 질문해도 답변이 나옵니다! 🎉

---

## 📚 카테고리별 설명

### `fees` (비용 관련)

**Supabase 테이블**: `kb_fees`

**매칭 키워드 추가 예시:**
```json
"fees": [
  "비용", "심사비", "심사료",
  "게재료", "게재비",
  "금액", "요금", "가격",
  "초과페이지", "페이지당"
]
```

**매칭되는 질문:**
- "급행심사료는 얼마인가요?"
- "게재비가 궁금해요"
- "초과페이지 요금은?"

---

### `schedule` (일정 관련)

**Supabase 테이블**: `kb_schedule`

**매칭 키워드 추가 예시:**
```json
"schedule": [
  "발간", "일정", "스케줄",
  "언제", "시기", "날짜",
  "마감", "데드라인"
]
```

**매칭되는 질문:**
- "발간 스케줄은?"
- "마감일은 언제인가요?"
- "투고 시기가 궁금해요"

---

### `membership` (회원 관련)

**Supabase 테이블**: `kb_membership`

**매칭 키워드 추가 예시:**
```json
"membership": [
  "회원", "정회원", "가입",
  "회비", "입회", "등록",
  "멤버십", "자격"
]
```

**매칭되는 질문:**
- "입회 방법은?"
- "멤버십 등록 어떻게 하나요?"
- "회원 자격 조건은?"

---

### `submission` (제출 관련)

**Supabase 테이블**: `kb_submission`

**매칭 키워드 추가 예시:**
```json
"submission": [
  "제출", "양식", "메일", "이메일",
  "제목", "투고", "신청", "접수",
  "서류", "첨부", "보내기"
]
```

**매칭되는 질문:**
- "투고 서류는?"
- "어떻게 접수하나요?"
- "첨부 파일은 무엇인가요?"

---

## 🎯 실전 팁

### 1. 동의어 추가

같은 의미의 단어를 모두 추가:

```json
"fees": [
  "비용", "가격", "금액", "요금",  // 동의어
  "심사비", "심사료",              // 심사 관련
  "게재료", "게재비"               // 게재 관련
]
```

### 2. 오타/변형 포함

사용자가 자주 쓰는 표현 추가:

```json
"schedule": [
  "일정", "스케줄", "스케쥴",  // 오타 포함
  "언제", "시기"
]
```

### 3. 약어/은어 포함

업계 용어나 약어 추가:

```json
"submission": [
  "제출", "투고", "서브밋",   // 약어
  "논문 제출", "원고 제출"
]
```

### 4. 외래어/한글 병기

```json
"membership": [
  "회원", "멤버", "member",
  "가입", "등록", "register"
]
```

---

## ⚙️ 동작 원리

### 내부 처리 방식

1. 사용자 질문: "급행심사료는 얼마인가요?"
2. `faqKeywords.fees` 배열의 모든 단어를 정규식으로 변환:
   ```javascript
   /(비용|심사비|심사료|게재료|...)/i
   ```
3. 질문에 "심사료" 포함 → `fees` 카테고리 매칭 ✅
4. `kb_fees` 테이블에서 데이터 조회
5. 답변 생성

### 코드 위치

**설정 로더**: `lib/config.ts`
```typescript
export function matchesFAQCategory(
  query: string, 
  category: 'fees' | 'schedule' | 'membership' | 'submission'
): boolean {
  const config = getCompanyConfig()
  const keywords = config.faqKeywords?.[category] || []
  const regex = new RegExp(keywords.join('|'), 'i')
  return regex.test(query)
}
```

**API 호출**: `app/api/ask/route.ts`
```typescript
if (matchesFAQCategory(trimmedQuestion, 'fees')) {
  // kb_fees 테이블 조회
}
```

---

## 🧪 테스트 방법

### 1. 로컬 테스트

```bash
npm run dev
# http://localhost:3000 접속
```

### 2. 질문 테스트

추가한 키워드로 질문:
- ✅ "급행심사료는?"
- ✅ "게재비 얼마인가요?"
- ✅ "초과페이지 요금은?"

### 3. 미매칭 확인

매칭 안 되는 질문 확인:
- ❌ "비용은 얼마?"
  - 너무 일반적 → RAG로 처리
- ❌ "할인은 있나요?"
  - 키워드 없음 → RAG로 처리

---

## 🚨 주의사항

### 1. 너무 일반적인 키워드 지양

```json
// ❌ 나쁜 예
"fees": ["는", "이", "가"]

// ✅ 좋은 예
"fees": ["비용", "심사비", "게재료"]
```

### 2. 카테고리 간 중복 최소화

```json
// ❌ 나쁜 예
"fees": ["제출", "비용"],
"submission": ["제출", "양식"]  // "제출" 중복

// ✅ 좋은 예
"fees": ["비용", "심사비"],
"submission": ["제출", "양식"]
```

### 3. 정규식 특수문자 주의

```json
// ❌ 나쁜 예
"fees": ["비용(원)", "금액$"]  // 특수문자 포함

// ✅ 좋은 예
"fees": ["비용", "원", "금액"]
```

---

## 💡 FAQ

### Q: 키워드를 추가해도 답변이 안 나와요

**A**: FAQ 기능이 활성화되어 있는지 확인:
```json
"features": {
  "enableFAQ": true  // ← 확인
}
```

### Q: Supabase 테이블이 없어요

**A**: FAQ 기능을 사용하려면 Supabase 테이블이 필요합니다:
```bash
# supabase/schema.sql 실행
# Supabase Dashboard → SQL Editor → schema.sql 붙여넣기 → Run
```

### Q: RAG와 FAQ 중 어떤 게 우선인가요?

**A**: FAQ가 먼저 체크됩니다:
1. 외부 링크 체크 (KCI 등)
2. **FAQ 체크** ← `faqKeywords`
3. RAG (벡터 검색)

### Q: 키워드 없이 항상 RAG만 사용할 수 있나요?

**A**: 네, FAQ 기능을 비활성화하면 됩니다:
```json
"features": {
  "enableFAQ": false
}
```

---

## 📖 관련 문서

- [README.md](../README.md) - 전체 프로젝트 가이드
- [SETUP_GUIDE.md](../SETUP_GUIDE.md) - 초기 설정 가이드
- [config/company.json.example](../config/company.json.example) - 설정 예시

---

궁금한 점이 있으면 GitHub Issue를 등록해주세요!

