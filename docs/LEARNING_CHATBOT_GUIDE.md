# 학습형 챗봇 관리 가이드

이 문서는 챗봇이 답변하지 못한 질문을 관리하고, 수동으로 답변을 추가하여 챗봇을 학습시키는 방법을 설명합니다.

---

## 개요

### 작동 원리

```
1️⃣ 사용자 질문
   ↓
2️⃣ FAQ 검색 → 없음
   ↓
3️⃣ RAG (PDF) 검색 → 없음
   ↓
4️⃣ 학습된 답변 검색 → 없음
   ↓
5️⃣ unanswered_questions에 저장
   ↓
6️⃣ "정보 없음 + 연락처" 응답

--- 관리자 작업 ---
7️⃣ /admin 페이지에서 미답변 질문 확인
   ↓
8️⃣ 답변 입력 → 저장
   ↓
9️⃣ learned_answers에 저장 (임베딩 자동 생성)

--- 다음 질문 ---
🔟 비슷한 질문 → 학습된 답변 반환
```

---

## 테이블 구조

### 1. unanswered_questions (미답변 질문)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | bigserial | 기본 키 |
| `question` | text | 사용자 질문 |
| `question_embedding` | vector(1536) | 질문 임베딩 |
| `asked_at` | timestamp | 마지막 질문 시각 |
| `asked_count` | int | 동일 질문 횟수 |
| `status` | text | `pending` / `answered` / `ignored` |
| `admin_note` | text | 관리자 메모 |
| `resolved_at` | timestamp | 처리 완료 시각 |

### 2. learned_answers (학습된 답변)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | bigserial | 기본 키 |
| `question` | text | 대표 질문 |
| `question_embedding` | vector(1536) | 질문 임베딩 |
| `answer` | text | 답변 내용 |
| `keywords` | text[] | 관련 키워드 |
| `created_by` | text | 작성자 |
| `created_at` | timestamp | 생성 시각 |
| `is_active` | boolean | 활성 상태 |
| `usage_count` | int | 사용된 횟수 |

---

## 관리자 페이지 사용법

### 접속 방법

```
로컬: http://localhost:3000/admin
배포: https://your-domain.com/admin
```

### 기능

#### 1. 미답변 질문 확인

- 왼쪽 패널에서 미답변 질문 목록 확인
- **질문 횟수**가 많은 것부터 정렬됨 (우선 처리 권장)
- 클릭하여 선택

#### 2. 답변 추가

1. 미답변 질문 선택
2. 오른쪽 패널에서 답변 입력
3. (선택) 키워드 입력 (쉼표로 구분)
4. "답변 저장" 클릭

#### 3. 질문 무시

- 스팸/무의미한 질문은 "무시" 버튼 클릭
- 상태가 `ignored`로 변경됨

#### 4. 학습된 답변 관리

- "학습된 답변" 탭에서 확인
- 활성화/비활성화 가능
- 사용 횟수 확인 가능

---

## API 엔드포인트

### POST /api/admin/add-answer

답변 추가 API

**Request Body:**

```json
{
  "questionId": 123,       // 미답변 질문 ID (선택)
  "question": "환불은 어떻게 하나요?",
  "answer": "환불은 구매 후 7일 이내에 가능합니다...",
  "keywords": ["환불", "반품", "교환"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "답변이 성공적으로 추가되었습니다.",
  "data": {
    "id": 1,
    "question": "환불은 어떻게 하나요?",
    "answer": "환불은 구매 후 7일 이내에 가능합니다...",
    "usage_count": 0
  }
}
```

---

## Supabase에서 직접 관리

관리자 페이지 대신 Supabase Dashboard에서도 관리 가능합니다.

### 미답변 질문 확인

```sql
SELECT id, question, asked_count, asked_at, status
FROM unanswered_questions
WHERE status = 'pending'
ORDER BY asked_count DESC, asked_at DESC;
```

### 답변 직접 추가 (임베딩 없이)

```sql
-- 주의: 임베딩이 없으면 벡터 검색 불가
-- 관리자 페이지 사용 권장

INSERT INTO learned_answers (question, answer, keywords, is_active)
VALUES (
  '환불 정책은?',
  '환불은 구매 후 7일 이내에 가능합니다.',
  ARRAY['환불', '반품'],
  true
);
```

### 학습된 답변 통계

```sql
SELECT 
  COUNT(*) as total_answers,
  SUM(usage_count) as total_usage,
  COUNT(*) FILTER (WHERE is_active) as active_count
FROM learned_answers;
```

---

## 검색 임계값 설정

### 학습된 답변 검색 (match_learned_answers)

- **기본값**: 0.80 (80% 유사도)
- 높을수록 정확한 매칭만 반환
- 낮출수록 더 많은 질문에 매칭

### 미답변 중복 체크 (match_unanswered)

- **기본값**: 0.90 (90% 유사도)
- 거의 동일한 질문만 중복으로 처리

---

## 베스트 프랙티스

### 1. 정기적 검토

- 주 1회 미답변 질문 확인 권장
- 질문 횟수가 많은 것부터 처리

### 2. 답변 품질

- 명확하고 간결하게 작성
- 필요시 연락처 포함
- 관련 키워드 추가 (선택)

### 3. 학습된 답변 관리

- 오래된/부정확한 답변 비활성화
- 사용 횟수 0인 답변 검토

### 4. PDF 우선

- 반복되는 질문은 PDF에 내용 추가 후 재인덱싱 권장
- 학습된 답변은 임시/긴급 대응용으로 활용

---

## 문제 해결

### Q: 학습된 답변이 반환되지 않음

**A:** 유사도 임계값 확인

```sql
-- schema.sql에서 match_learned_answers 함수 수정
similarity_threshold float default 0.75  -- 낮추면 더 많이 매칭
```

### Q: 같은 질문이 계속 저장됨

**A:** 중복 체크 임계값 확인

```sql
-- match_unanswered 함수의 임계값
similarity_threshold float default 0.90  -- 낮추면 더 많은 중복 감지
```

### Q: 관리자 페이지 접근 제한

**A:** 현재 인증 없이 접근 가능. 필요시 미들웨어로 보호:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 인증 로직 추가
  }
}
```

---

## 관련 파일

| 파일 | 설명 |
|------|------|
| `supabase/schema.sql` | 테이블 및 RPC 함수 정의 |
| `app/api/ask/route.ts` | 챗봇 API (학습된 답변 검색 로직) |
| `app/api/admin/add-answer/route.ts` | 답변 추가 API |
| `app/admin/page.tsx` | 관리자 페이지 UI |

