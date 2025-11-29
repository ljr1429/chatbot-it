-- supabase/schema.sql
-- KITPM 학회 투고 안내 챗봇 스키마 (FAQ 정형 테이블 + RAG 벡터 인덱스 + RPC + RLS)

-- pgvector 확장 활성화
create extension if not exists vector;

-- ===================
-- FAQ 정형 테이블
-- ===================

-- 발간 일정
create table if not exists kb_schedule(
  id bigserial primary key,
  issues text[] not null,      -- 예: {"03-31","06-30","09-30","12-31"}
  source text default 'KITPM_2026년_논문_투고안내.pdf',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 비용 (급행/일반)
create table if not exists kb_fees(
  id bigserial primary key,
  type text check (type in ('일반','급행')) not null,
  review_fee_krw int not null,
  publication_fee_krw int not null,
  overpage_rule text,
  note text,
  source text default 'KITPM_2026년_논문_투고안내.pdf',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 회원 요건
create table if not exists kb_membership(
  id bigserial primary key,
  membership_required bool not null default true,
  join_fee_krw int,
  annual_fee_krw int,
  bank_account text,
  contact text,
  source text default 'KITPM_2026년_논문_투고안내.pdf',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 제출 방법
create table if not exists kb_submission(
  id bigserial primary key,
  site text,
  email text,
  subject_rule text,
  forms text[],
  notes text,
  source text default 'KITPM_2026년_논문_투고안내.pdf',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- ===================
-- RAG 벡터 인덱스
-- ===================

-- OpenAI text-embedding-3-small 기준 (1536 차원)
create table if not exists rag_chunks(
  id bigserial primary key,
  doc_name text not null,
  section text,
  page int,
  content text not null,
  embedding vector(1536),
  created_at timestamp default now()
);

-- 문서명/섹션별 복합 인덱스
create index if not exists idx_rag_doc_section on rag_chunks(doc_name, section);

-- 벡터 유사도 검색용 RPC
create or replace function match_chunks(
  query_embedding vector,
  match_count int default 3,
  similarity_threshold float default 0.75
)
returns table(id bigint, doc_name text, section text, page int, content text, score float)
language sql stable as $$
  select
    rc.id,
    rc.doc_name,
    rc.section,
    rc.page,
    rc.content,
    1 - (rc.embedding <=> query_embedding) as score
  from rag_chunks rc
  where 1 - (rc.embedding <=> query_embedding) >= similarity_threshold
  order by rc.embedding <=> query_embedding
  limit match_count;
$$;

-- ===================
-- 로그 테이블 (선택)
-- ===================

create table if not exists query_logs(
  id bigserial primary key,
  q text,
  intent text,
  answer text,
  created_at timestamp default now()
);

-- ===================
-- RLS (Row Level Security)
-- ===================

-- RLS 활성화
alter table kb_schedule enable row level security;
alter table kb_fees enable row level security;
alter table kb_membership enable row level security;
alter table kb_submission enable row level security;
alter table rag_chunks enable row level security;
alter table query_logs enable row level security;

-- 익명 사용자 읽기 권한 (FAQ 및 RAG 청크)
create policy "anon read kb_schedule" on kb_schedule
  for select to anon using (true);
create policy "anon read kb_fees" on kb_fees
  for select to anon using (true);
create policy "anon read kb_membership" on kb_membership
  for select to anon using (true);
create policy "anon read kb_submission" on kb_submission
  for select to anon using (true);
create policy "anon read rag_chunks" on rag_chunks
  for select to anon using (true);

-- 서비스 롤 전체 권한 (데이터 관리)
create policy "service manage kb_schedule" on kb_schedule
  for all to service_role using (true) with check (true);
create policy "service manage kb_fees" on kb_fees
  for all to service_role using (true) with check (true);
create policy "service manage kb_membership" on kb_membership
  for all to service_role using (true) with check (true);
create policy "service manage kb_submission" on kb_submission
  for all to service_role using (true) with check (true);
create policy "service manage rag_chunks" on rag_chunks
  for all to service_role using (true) with check (true);

-- 로그: 서비스 롤만 쓰기, 익명은 읽기만
create policy "service insert logs" on query_logs
  for insert to service_role with check (true);
create policy "anon read logs" on query_logs
  for select to anon using (true);

-- ===================
-- 학습형 챗봇 테이블
-- ===================

-- 미답변 질문 저장 테이블
create table if not exists unanswered_questions (
  id bigserial primary key,
  question text not null,
  question_embedding vector(1536),
  asked_at timestamp with time zone default now(),
  asked_count int default 1,
  status text default 'pending' check (status in ('pending', 'answered', 'ignored')),
  admin_note text,
  resolved_at timestamp with time zone
);

-- 학습된 질문-답변 쌍
create table if not exists learned_answers (
  id bigserial primary key,
  question text not null,
  question_embedding vector(1536),
  answer text not null,
  keywords text[],
  created_by text default 'admin',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_active boolean default true,
  usage_count int default 0
);

-- 인덱스
create index if not exists idx_unanswered_status on unanswered_questions(status);
create index if not exists idx_unanswered_asked on unanswered_questions(asked_at desc);
create index if not exists idx_learned_active on learned_answers(is_active);
create index if not exists idx_learned_created on learned_answers(created_at desc);

-- 학습된 답변 벡터 검색 함수
create or replace function match_learned_answers(
  query_embedding vector,
  match_count int default 3,
  similarity_threshold float default 0.80
)
returns table(
  id bigint,
  question text,
  answer text,
  keywords text[],
  usage_count int,
  score float
)
language sql stable as $$
  select
    la.id,
    la.question,
    la.answer,
    la.keywords,
    la.usage_count,
    1 - (la.question_embedding <=> query_embedding) as score
  from learned_answers la
  where la.is_active = true
    and 1 - (la.question_embedding <=> query_embedding) > similarity_threshold
  order by la.question_embedding <=> query_embedding
  limit match_count;
$$;

-- 미답변 질문 중복 검색 함수
create or replace function match_unanswered(
  query_embedding vector,
  match_count int default 1,
  similarity_threshold float default 0.90
)
returns table(
  id bigint,
  question text,
  asked_count int,
  score float
)
language sql stable as $$
  select
    uq.id,
    uq.question,
    uq.asked_count,
    1 - (uq.question_embedding <=> query_embedding) as score
  from unanswered_questions uq
  where uq.status = 'pending'
    and 1 - (uq.question_embedding <=> query_embedding) > similarity_threshold
  order by uq.question_embedding <=> query_embedding
  limit match_count;
$$;

-- RLS 활성화
alter table unanswered_questions enable row level security;
alter table learned_answers enable row level security;

-- 정책: 서비스 롤 전체 권한
create policy "service manage unanswered" on unanswered_questions
  for all to service_role using (true) with check (true);
create policy "service manage learned" on learned_answers
  for all to service_role using (true) with check (true);

-- 정책: 익명 사용자 읽기 권한 (관리자 페이지용)
create policy "anon read unanswered" on unanswered_questions
  for select to anon using (true);
create policy "anon read learned" on learned_answers
  for select to anon using (true);

