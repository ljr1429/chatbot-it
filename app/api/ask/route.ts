// app/api/ask/route.ts
// 챗봇 질의 응답 API (의도 라우팅 + FAQ + RAG)

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseClient, getSupabaseServiceClient } from "@/lib/supabase";
import { 
  getCompanyConfig, 
  shouldUseExternalLinks, 
  getRecommendedLinks, 
  getFAQKeywords,
  matchesFAQCategory
} from "@/lib/config";
import { CHATBOT_CONFIG } from "@/lib/constants";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

interface ChatResponse {
  intent: string;
  answer: string;
  citations?: string[];
  links?: Array<{ label: string; href: string }>;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "질문을 입력해주세요." },
        { status: 400 }
      );
    }

    const trimmedQuestion = question.trim();
    const companyConfig = getCompanyConfig();

    // ==================
    // 1) 외부 링크 질의 (설정에서 활성화 시)
    // ==================
    if (companyConfig.features?.enableExternalLinks && shouldUseExternalLinks(trimmedQuestion)) {
      const links = getRecommendedLinks(trimmedQuestion);
      const answer = `다음 링크에서 정보를 확인하실 수 있습니다:

아래 링크를 클릭하여 자세한 내용을 확인하세요.`;

      return NextResponse.json<ChatResponse>({
        intent: "external_links",
        answer,
        citations: ["외부 링크"],
        links,
      });
    }

    // ==================
    // 2) 학습된 답변 우선 검색 (관리자가 추가한 답변)
    // ==================
    const sbService = getSupabaseServiceClient();
    
    // 임베딩 생성 (학습된 답변 + RAG 모두에서 사용)
    const embResponse = await openai.embeddings.create({
      model: CHATBOT_CONFIG.EMBEDDING_MODEL,
      input: trimmedQuestion,
    });
    const embedding = embResponse.data[0].embedding;
    const vecString = `[${embedding.join(",")}]`;

    // 학습된 답변에서 먼저 검색
    const { data: learnedHits } = await sbService.rpc("match_learned_answers", {
      query_embedding: vecString,
      match_count: 1,
      similarity_threshold: 0.75,
    });

    if (learnedHits && learnedHits.length > 0) {
      const learned = learnedHits[0];
      
      // 사용 횟수 증가
      await sbService
        .from("learned_answers")
        .update({ usage_count: (learned.usage_count || 0) + 1 })
        .eq("id", learned.id);

      return NextResponse.json<ChatResponse>({
        intent: "learned",
        answer: learned.answer,
        citations: ["관리자가 추가한 답변"],
      });
    }

    // ==================
    // 3) FAQ (정형 데이터) - 설정에서 활성화 시
    // ==================
    const faqKeywords = getFAQKeywords();
    if (companyConfig.features?.enableFAQ && faqKeywords && faqKeywords.test(trimmedQuestion)) {
      // 비용/심사비/게재료
      if (matchesFAQCategory(trimmedQuestion, 'fees')) {
        const { data } = await supabaseClient.from("kb_fees").select("*");
        if (!data || data.length === 0) {
          return NextResponse.json<ChatResponse>({
            intent: "faq",
            answer: "비용 정보를 찾을 수 없습니다. 학회에 문의해주세요.",
            citations: [],
          });
        }

        const feeText = data
          .map(
            (r: any) =>
              `${r.type}: 심사비 ${Number(r.review_fee_krw).toLocaleString()}원, 게재료 ${Number(r.publication_fee_krw).toLocaleString()}원`
          )
          .join(" / ");

        const extra = data[0]?.overpage_rule
          ? `\n\n초과페이지 규정: ${data[0].overpage_rule}`
          : "";

        const answer = `게재 비용은 다음과 같습니다.\n\n${feeText}${extra}`;

        return NextResponse.json<ChatResponse>({
          intent: "faq",
          answer,
          citations: ["KITPM_2026 투고안내 – 심사비·게재료"],
        });
      }

      // 발간 일정
      if (matchesFAQCategory(trimmedQuestion, 'schedule')) {
        const { data } = await supabaseClient
          .from("kb_schedule")
          .select("*")
          .single();

        if (!data || !data.issues) {
          return NextResponse.json<ChatResponse>({
            intent: "faq",
            answer: "발간 일정 정보를 찾을 수 없습니다.",
            citations: [],
          });
        }

        const answer = `연간 발간일은 ${data.issues.join(", ")} 입니다.`;

        return NextResponse.json<ChatResponse>({
          intent: "faq",
          answer,
          citations: ["KITPM_2026 투고안내 – 발간 일정"],
        });
      }

      // 회원/회비
      if (matchesFAQCategory(trimmedQuestion, 'membership')) {
        const { data } = await supabaseClient
          .from("kb_membership")
          .select("*")
          .single();

        if (!data) {
          return NextResponse.json<ChatResponse>({
            intent: "faq",
            answer: "회원 정보를 찾을 수 없습니다.",
            citations: [],
          });
        }

        const answer = `정회원만 투고 가능합니다.

가입비: ${Number(data.join_fee_krw).toLocaleString()}원
연회비: ${Number(data.annual_fee_krw).toLocaleString()}원
계좌: ${data.bank_account}
연락처: ${data.contact}`;

        return NextResponse.json<ChatResponse>({
          intent: "faq",
          answer,
          citations: ["KITPM_2026 투고안내 – 회원/회비"],
        });
      }

      // 제출/양식/메일/제목
      if (matchesFAQCategory(trimmedQuestion, 'submission')) {
        const { data } = await supabaseClient
          .from("kb_submission")
          .select("*")
          .single();

        if (!data) {
          return NextResponse.json<ChatResponse>({
            intent: "faq",
            answer: "제출 정보를 찾을 수 없습니다.",
            citations: [],
          });
        }

        const answer = `홈페이지에서 양식을 내려받아 작성 후 이메일로 제출하세요.

이메일: ${data.email}
제목 규칙: ${data.subject_rule}
필수 양식: ${data.forms?.join(", ")}

${data.notes}`;

        return NextResponse.json<ChatResponse>({
          intent: "faq",
          answer,
          citations: ["KITPM_2026 투고안내 – 투고 방법/제출서류"],
        });
      }
    }

    // ==================
    // 4) RAG (벡터 검색)
    // ==================
    // 임베딩과 sbService는 위에서 이미 생성됨
    const { data: hits, error } = await sbService.rpc("match_chunks", {
      query_embedding: vecString,
      match_count: CHATBOT_CONFIG.RAG_MATCH_COUNT,
      similarity_threshold: CHATBOT_CONFIG.RAG_SIMILARITY_THRESHOLD,
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      return NextResponse.json<ChatResponse>(
        {
          intent: "error",
          answer: "검색 중 오류가 발생했습니다.",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // 검색 결과가 없는 경우 → 미답변 큐에 저장
    // (학습된 답변은 이미 위에서 먼저 검색됨)
    if (!hits || hits.length === 0) {
      await saveUnansweredQuestion(sbService, trimmedQuestion, embedding);

      const contactInfo = `${companyConfig.contact.email}${companyConfig.contact.phone ? ' / ' + companyConfig.contact.phone : ''}`;
      return NextResponse.json<ChatResponse>({
        intent: "rag",
        answer: `죄송합니다. 해당 질문에 대한 정보를 찾을 수 없습니다. 직접 문의해주시기 바랍니다.\n\n연락처: ${contactInfo}`,
        citations: [],
      });
    }

    // 컨텍스트 생성
    const context = hits
      .map(
        (h: any) =>
          `[${h.doc_name} / ${h.section} p.${h.page}]\n${h.content}`
      )
      .join("\n\n---\n\n");

    // LLM으로 답변 생성
    const chatCompletion = await openai.chat.completions.create({
      model: CHATBOT_CONFIG.CHAT_MODEL,
      temperature: CHATBOT_CONFIG.CHAT_TEMPERATURE,
      max_tokens: CHATBOT_CONFIG.CHAT_MAX_TOKENS,
      messages: [
        {
          role: "system",
          content: CHATBOT_CONFIG.SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `질문: ${trimmedQuestion}\n\n다음 근거만 사용해 답하세요:\n\n${context}`,
        },
      ],
    });

    const answer = chatCompletion.choices[0].message?.content || "답변을 생성할 수 없습니다.";
    const citations = hits.map(
      (h: any) => `${h.doc_name} / ${h.section} p.${h.page}`
    );

    return NextResponse.json<ChatResponse>({
      intent: "rag",
      answer,
      citations,
    });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json<ChatResponse>(
      {
        intent: "error",
        answer: "서버 오류가 발생했습니다.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * 미답변 질문 저장 (중복 체크 포함)
 */
async function saveUnansweredQuestion(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  question: string,
  embedding: number[]
) {
  try {
    const vecString = `[${embedding.join(",")}]`;

    // 비슷한 질문이 이미 있는지 확인 (유사도 0.9 이상)
    const { data: existing } = await supabase.rpc("match_unanswered", {
      query_embedding: vecString,
      match_count: 1,
      similarity_threshold: 0.90,
    });

    if (existing && existing.length > 0) {
      // 이미 있는 질문이면 asked_count만 증가
      await supabase
        .from("unanswered_questions")
        .update({
          asked_count: existing[0].asked_count + 1,
          asked_at: new Date().toISOString(),
        })
        .eq("id", existing[0].id);
      
      console.log(`미답변 질문 업데이트: "${question}" (횟수: ${existing[0].asked_count + 1})`);
    } else {
      // 새 질문 저장
      await supabase.from("unanswered_questions").insert({
        question,
        question_embedding: vecString,
        status: "pending",
      });
      
      console.log(`새 미답변 질문 저장: "${question}"`);
    }
  } catch (error) {
    console.error("미답변 질문 저장 오류:", error);
    // 저장 실패해도 사용자 응답에는 영향 없음
  }
}

