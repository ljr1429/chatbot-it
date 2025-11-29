import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KITPM 투고 안내 챗봇",
  description: "한국IT정책경영학회 논문 투고 절차 및 KCI 탐색을 돕는 AI 챗봇",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

