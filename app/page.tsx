// app/page.tsx
import ChatContainer from "@/components/ChatContainer";
import { getCompanyConfig } from "@/lib/config";

export default function Home() {
  const config = getCompanyConfig();
  
  return (
    <main className="h-screen w-screen overflow-hidden bg-gray-50">
      <div className="h-full max-w-4xl mx-auto bg-white shadow-lg">
        <ChatContainer
          title={config.chatbot.title}
          description={config.description}
          welcomeMessage={config.chatbot.welcomeMessage}
          sampleQuestions={config.chatbot.sampleQuestions}
        />
      </div>
    </main>
  );
}

