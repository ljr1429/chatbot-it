# ✅ 새 회사 챗봇 설정 체크리스트

회사명: ____________________  
설정일: ____________________  
담당자: ____________________

---

## 1. 사전 준비

- [ ] 회사 정보 수집 완료
  - [ ] 회사명 (한글/영문)
  - [ ] 로고 파일
  - [ ] 연락처 (이메일, 전화번호)
  - [ ] 웹사이트 URL
- [ ] PDF 파일 수집 완료
- [ ] 외부 링크 목록 정리

---

## 2. 계정 및 API 키

- [ ] Supabase 프로젝트 생성
  - Project URL: ____________________
  - Anon Key: ____________________
  - Service Role: ____________________

- [ ] OpenAI API 키 발급
  - API Key: ____________________

- [ ] Vercel 프로젝트 생성 (배포용)

---

## 3. 환경 설정

- [ ] `.env` 파일 생성
- [ ] 환경변수 입력 완료
  - [ ] OPENAI_API_KEY
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE

---

## 4. Supabase 설정

- [ ] `schema.sql` 실행 완료
- [ ] 테이블 생성 확인
  - [ ] rag_chunks
  - [ ] kb_schedule
  - [ ] kb_fees
  - [ ] kb_membership
  - [ ] kb_submission
  - [ ] query_logs
  - [ ] unanswered_questions
  - [ ] learned_answers

---

## 5. 설정 파일 수정

- [ ] `config/company.json` 수정
  - [ ] 회사명
  - [ ] 연락처
  - [ ] 챗봇 메시지
  - [ ] 색상 테마
  - [ ] FAQ 키워드

- [ ] `config/external-links.json` 수정
  - [ ] 외부 링크 추가
  - [ ] 키워드 설정

---

## 6. PDF 인덱싱

- [ ] `data/` 폴더에 PDF 파일 복사
- [ ] Python 패키지 설치 (`pip install -r requirements.txt`)
- [ ] 인덱싱 실행 (`python scripts/index_all_pdfs.py`)
- [ ] 인덱싱 확인 (`python scripts/check_rag_chunks.py`)
  - 총 청크 수: ____________________

---

## 7. 테스트

- [ ] 로컬 서버 실행 (`npm run dev`)
- [ ] 챗봇 UI 확인
- [ ] 외부 링크 질문 테스트
- [ ] FAQ 질문 테스트
- [ ] PDF 내용 질문 테스트
- [ ] 관리자 페이지 (/admin) 테스트

---

## 8. 배포

- [ ] GitHub 저장소 푸시
- [ ] Vercel 환경변수 설정
- [ ] Vercel 배포 완료
- [ ] 배포 URL 확인: ____________________

---

## 9. 고객 인수

- [ ] 배포 URL 전달
- [ ] 관리자 페이지 사용법 안내
- [ ] 문서 전달

---

## 비고

```
(추가 메모 공간)




```

---

설정 완료 확인: ____________________  
확인 일자: ____________________

