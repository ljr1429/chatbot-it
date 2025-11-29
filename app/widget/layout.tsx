// app/widget/layout.tsx
// 위젯용 최소 레이아웃

export const metadata = {
  title: "AI 챗봇 위젯",
};

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-screen overflow-hidden">{children}</div>;
}

