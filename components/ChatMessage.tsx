// components/ChatMessage.tsx
"use client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  links?: Array<{ label: string; href: string }>;
}

export default function ChatMessage({
  role,
  content,
  citations,
  links,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-fade-in`}
    >
      <div
        className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary-600 text-white"
            : "bg-gray-100 text-gray-900 border border-gray-200"
        }`}
      >
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </div>

        {citations && citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-300">
            <p className="text-xs text-gray-600 font-medium mb-1">출처</p>
            <ul className="text-xs text-gray-500 space-y-1">
              {citations.map((citation, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="mr-1">•</span>
                  <span>{citation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {links && links.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-3 py-1.5 text-xs font-medium bg-white text-primary-700 border border-primary-300 rounded-full hover:bg-primary-50 transition-colors"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

