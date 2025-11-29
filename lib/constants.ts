// lib/constants.ts
// 챗봇 설정 상수

export const CHATBOT_CONFIG = {
  // 임베딩 모델
  EMBEDDING_MODEL: "text-embedding-3-small" as const,
  EMBEDDING_DIMENSION: 1536,

  // 채팅 모델
  CHAT_MODEL: "gpt-4o-mini" as const,
  CHAT_TEMPERATURE: 0.2,
  CHAT_MAX_TOKENS: 500,

  // RAG 설정
  RAG_MATCH_COUNT: 5,
  RAG_SIMILARITY_THRESHOLD: 0.45,  // 한글 벡터 검색에 최적화된 임계값

  // 시스템 프롬프트
  SYSTEM_PROMPT:
    "당신은 KITPM 학회 투고 안내 전문가입니다. 제공된 근거만 사용해 정확하고 간결하게 답변하세요. 숫자와 날짜는 정확히 표기하고, 근거가 불충분하면 '자세한 내용은 학회에 문의하세요'라고 안내하세요. 5문장 이내로 답변하세요.",

  // 의도 감지 키워드
  FAQ_KEYWORDS: /(발간|일정|비용|심사비|게재료|초과페이지|회원|정회원|가입|회비|제출|양식|메일|제목|계좌|연락)/,
  KCI_KEYWORDS: /(KCI|인용|통계|유사도|원문|학술지|연구동향)/,

  // 연락처
  CONTACT: {
    EMAIL: "kitpm@kitpm.kr",
    PHONE: "010-9944-8282",
  },
} as const;

// 샘플 질문
export const SAMPLE_QUESTIONS = [
  "발간 일정은 언제인가요?",
  "급행 심사 비용은 얼마인가요?",
  "회원 가입은 어떻게 하나요?",
  "KCI에서 논문 검색하는 방법",
] as const;

