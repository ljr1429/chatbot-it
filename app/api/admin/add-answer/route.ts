// app/api/admin/add-answer/route.ts
// 관리자용 답변 추가 API

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { CHATBOT_CONFIG } from "@/lib/constants";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

interface AddAnswerRequest {
  questionId?: number;  // unanswered_questions ID (선택)
  question: string;
  answer: string;
  keywords?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body: AddAnswerRequest = await req.json();
    const { questionId, question, answer, keywords } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "질문과 답변을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    // 질문에 대한 임베딩 생성
    const embResponse = await openai.embeddings.create({
      model: CHATBOT_CONFIG.EMBEDDING_MODEL,
      input: question.trim(),
    });
    const embedding = embResponse.data[0].embedding;
    const vecString = `[${embedding.join(",")}]`;

    const sbService = getSupabaseServiceClient();

    // learned_answers에 저장
    const { data: insertedAnswer, error: insertError } = await sbService
      .from("learned_answers")
      .insert({
        question: question.trim(),
        question_embedding: vecString,
        answer: answer.trim(),
        keywords: keywords || [],
        created_by: "admin",
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("답변 저장 오류:", insertError);
      return NextResponse.json(
        { error: "답변 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // questionId가 있으면 해당 미답변 질문 상태 업데이트
    if (questionId) {
      await sbService
        .from("unanswered_questions")
        .update({
          status: "answered",
          resolved_at: new Date().toISOString(),
          admin_note: `learned_answers ID: ${insertedAnswer.id}`,
        })
        .eq("id", questionId);
    } else {
      // 직접 입력인 경우에도 unanswered_questions에 기록 (answered 상태로)
      await sbService.from("unanswered_questions").insert({
        question: question.trim(),
        question_embedding: vecString,
        status: "answered",
        asked_count: 0,
        admin_note: `직접 입력 - learned_answers ID: ${insertedAnswer.id}`,
        resolved_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "답변이 성공적으로 추가되었습니다.",
      data: insertedAnswer,
    });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다.", details: error.message },
      { status: 500 }
    );
  }
}

