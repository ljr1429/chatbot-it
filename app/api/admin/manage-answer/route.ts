// app/api/admin/manage-answer/route.ts
// 학습된 답변 관리 API (활성화/비활성화, 삭제)

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";

interface ManageRequest {
  id: number;
  action: "toggle" | "delete";
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

    if (action === "toggle") {
      // 현재 상태 조회
      const { data: current, error: fetchError } = await sbService
        .from("learned_answers")
        .select("is_active")
        .eq("id", id)
        .single();

      if (fetchError || !current) {
        return NextResponse.json(
          { error: "답변을 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      // 토글
      const { error: updateError } = await sbService
        .from("learned_answers")
        .update({ is_active: !current.is_active })
        .eq("id", id);

      if (updateError) {
        console.error("토글 오류:", updateError);
        return NextResponse.json(
          { error: "상태 변경 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: current.is_active ? "비활성화되었습니다." : "활성화되었습니다.",
        is_active: !current.is_active,
      });
    }

    if (action === "delete") {
      const { error: deleteError } = await sbService
        .from("learned_answers")
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
        message: "삭제되었습니다.",
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

