// lib/supabase.ts
// Supabase 클라이언트 생성 유틸리티

import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
}

// 클라이언트 전용 (익명 키, 브라우저에서도 안전)
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 서버 전용 클라이언트 (서비스 롤 키, 서버 API에서만 사용)
export function getSupabaseServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE) {
    throw new Error("SUPABASE_SERVICE_ROLE is not set (server-side only)");
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

