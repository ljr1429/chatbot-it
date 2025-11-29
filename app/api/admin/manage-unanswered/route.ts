// app/api/admin/manage-unanswered/route.ts
// 미답변 질문 관리 API (무시, 삭제)

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";

interface ManageRequest {
  id: number;
  action: "ignore" | "delete";
}

export async function POST(req: NextRequest) {
  try {
    const body: ManageRequest = await req.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: "id와 action을 입력해주세요." },
        { status: 400 }
      );
    }

    const sbService = getSupabaseServiceClient();

    if (action === "ignore") {
      const { error: updateError } = await sbService
        .from("unanswered_questions")
        .update({
          status: "ignored",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        console.error("무시 처리 오류:", updateError);
        return NextResponse.json(
          { error: "무시 처리 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "질문이 무시 처리되었습니다.",
      });
    }

    if (action === "delete") {
      const { error: deleteError } = await sbService
        .from("unanswered_questions")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("삭제 오류:", deleteError);
        return NextResponse.json(
          { error: "삭제 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "질문이 삭제되었습니다.",
      });
    }

    return NextResponse.json(
      { error: "유효하지 않은 action입니다." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다.", details: error.message },
      { status: 500 }
    );
  }
}

