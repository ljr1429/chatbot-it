-- supabase/seed.sql
-- KITPM_2026년_논문_투고안내.pdf 및 첨부 양식 기반 시드 데이터

-- 발간 일정 (연 4회)
insert into kb_schedule(issues, source)
values (
  array['03-31','06-30','09-30','12-31'],
  'KITPM_2026년_논문_투고안내.pdf'
)
on conflict do nothing;

-- 비용 (급행/일반)
insert into kb_fees(type, review_fee_krw, publication_fee_krw, overpage_rule, note, source)
values
  (
    '급행',
    250000,
    300000,
    '10p≤: 50,000원 / 13p≤: 100,000원 / 14p+: 20,000원(페이지당)',
    '기업/단체회원 여부에 따라 상이할 수 있음',
    'KITPM_2026년_논문_투고안내.pdf'
  ),
  (
    '일반',
    100000,
    150000,
    '10p≤: 50,000원 / 13p≤: 100,000원 / 14p+: 20,000원(페이지당)',
    null,
    'KITPM_2026년_논문_투고안내.pdf'
  )
on conflict do nothing;

-- 회원 요건
insert into kb_membership(
  membership_required,
  join_fee_krw,
  annual_fee_krw,
  bank_account,
  contact,
  source
)
values (
  true,
  100000,
  100000,
  '우리은행 1005-604-043398 한국IT정책경영학회',
  'kitpm@kitpm.kr / 010-9944-8282',
  'KITPM_2026년_논문_투고안내.pdf, 입회원서'
)
on conflict do nothing;

-- 제출 방법
insert into kb_submission(site, email, subject_rule, forms, notes, source)
values (
  'https://kitpm.kr',
  'kitpm@kitpm.kr',
  '주저자명_제목_급행/일반',
  array['논문작성양식','투고신청서','저작권이양','개인정보동의'],
  '홈페이지에서 양식 다운로드 및 작성 → 이메일 제출 → 회신 메일 확인 후 비용 입금',
  'KITPM_2026년_논문_투고안내.pdf, 양식2-4'
)
on conflict do nothing;

