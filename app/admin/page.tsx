"use client";

// app/admin/page.tsx
// 관리자 페이지 - 미답변 질문 관리 및 답변 추가

import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/lib/supabase";

interface UnansweredQuestion {
  id: number;
  question: string;
  asked_at: string;
  asked_count: number;
  status: string;
}

interface LearnedAnswer {
  id: number;
  question: string;
  answer: string;
  keywords: string[];
  usage_count: number;
  created_at: string;
  is_active: boolean;
}

export default function AdminPage() {
  const [unansweredQuestions, setUnansweredQuestions] = useState<UnansweredQuestion[]>([]);
  const [learnedAnswers, setLearnedAnswers] = useState<LearnedAnswer[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<UnansweredQuestion | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"unanswered" | "learned">("unanswered");
  
  // 직접 입력 모드
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualQuestion, setManualQuestion] = useState("");
  
  // 페이지네이션
  const [unansweredPage, setUnansweredPage] = useState(1);
  const [learnedPage, setLearnedPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // 미답변 질문 로드
  const loadUnansweredQuestions = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from("unanswered_questions")
      .select("id, question, asked_at, asked_count, status")
      .eq("status", "pending")
      .order("asked_count", { ascending: false })
      .order("asked_at", { ascending: false });

    if (!error && data) {
      setUnansweredQuestions(data);
    }
  }, []);

  // 학습된 답변 로드
  const loadLearnedAnswers = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from("learned_answers")
      .select("id, question, answer, keywords, usage_count, created_at, is_active")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLearnedAnswers(data);
    }
  }, []);

  useEffect(() => {
    loadUnansweredQuestions();
    loadLearnedAnswers();
  }, [loadUnansweredQuestions, loadLearnedAnswers]);

  // 답변 제출
  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      setMessage({ type: "error", text: "답변을 입력해주세요." });
      return;
    }

    // 직접 입력 모드일 때는 manualQuestion 확인
    if (isManualMode) {
      if (!manualQuestion.trim()) {
        setMessage({ type: "error", text: "질문을 입력해주세요." });
        return;
      }
    } else if (!selectedQuestion) {
      setMessage({ type: "error", text: "질문을 선택해주세요." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/add-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: isManualMode ? undefined : selectedQuestion?.id,
          question: isManualMode ? manualQuestion.trim() : selectedQuestion?.question,
          answer: answerText.trim(),
          keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "답변이 성공적으로 추가되었습니다!" });
        setSelectedQuestion(null);
        setAnswerText("");
        setKeywords("");
        setManualQuestion("");
        setIsManualMode(false);
        await loadUnansweredQuestions();
        await loadLearnedAnswers();
      } else {
        setMessage({ type: "error", text: result.error || "오류가 발생했습니다." });
      }
    } catch {
      setMessage({ type: "error", text: "서버 연결 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  };

  // 질문 무시 처리
  const handleIgnoreQuestion = async (id: number) => {
    try {
      const response = await fetch("/api/admin/manage-unanswered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "ignore" }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: result.message });
        await loadUnansweredQuestions();
      } else {
        setMessage({ type: "error", text: result.error || "오류가 발생했습니다." });
      }
    } catch {
      setMessage({ type: "error", text: "서버 연결 오류가 발생했습니다." });
    }
  };

  // 미답변 질문 삭제
  const handleDeleteQuestion = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/manage-unanswered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "delete" }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: result.message });
        await loadUnansweredQuestions();
      } else {
        setMessage({ type: "error", text: result.error || "오류가 발생했습니다." });
      }
    } catch {
      setMessage({ type: "error", text: "서버 연결 오류가 발생했습니다." });
    }
  };

  // 학습된 답변 활성화/비활성화 토글
  const handleToggleActive = async (id: number) => {
    try {
      const response = await fetch("/api/admin/manage-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "toggle" }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: result.message });
        await loadLearnedAnswers();
      } else {
        setMessage({ type: "error", text: result.error || "오류가 발생했습니다." });
      }
    } catch {
      setMessage({ type: "error", text: "서버 연결 오류가 발생했습니다." });
    }
  };

  // 학습된 답변 삭제
  const handleDeleteAnswer = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/manage-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "delete" }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: result.message });
        await loadLearnedAnswers();
      } else {
        setMessage({ type: "error", text: result.error || "오류가 발생했습니다." });
      }
    } catch {
      setMessage({ type: "error", text: "서버 연결 오류가 발생했습니다." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">챗봇 관리자</h1>
          <p className="text-sm text-gray-500 mt-1">미답변 질문 관리 및 학습된 답변 확인</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 메시지 표시 */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 탭 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("unanswered")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "unanswered"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            미답변 질문 ({unansweredQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab("learned")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "learned"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            학습된 답변 ({learnedAnswers.length})
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 질문 목록 */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h2 className="font-semibold text-lg mb-4">
              {activeTab === "unanswered" ? "미답변 질문 목록" : "학습된 답변 목록"}
            </h2>

            {activeTab === "unanswered" ? (
              <>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {unansweredQuestions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">미답변 질문이 없습니다.</p>
                  ) : (
                    unansweredQuestions
                      .slice((unansweredPage - 1) * ITEMS_PER_PAGE, unansweredPage * ITEMS_PER_PAGE)
                      .map((q) => (
                        <div
                          key={q.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedQuestion?.id === q.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedQuestion(q)}
                        >
                          <p className="font-medium text-gray-900">{q.question}</p>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                            <span>질문 횟수: {q.asked_count}회</span>
                            <span>
                              {new Date(q.asked_at).toLocaleDateString("ko-KR")}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIgnoreQuestion(q.id);
                              }}
                              className="text-orange-500 hover:text-orange-700"
                            >
                              무시
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuestion(q.id);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
                {/* 미답변 질문 페이지네이션 */}
                {unansweredQuestions.length > ITEMS_PER_PAGE && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-500">
                      {unansweredQuestions.length}개 중 {(unansweredPage - 1) * ITEMS_PER_PAGE + 1}-
                      {Math.min(unansweredPage * ITEMS_PER_PAGE, unansweredQuestions.length)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUnansweredPage((p) => Math.max(1, p - 1))}
                        disabled={unansweredPage === 1}
                        className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        이전
                      </button>
                      <span className="px-3 py-1 text-sm">
                        {unansweredPage} / {Math.ceil(unansweredQuestions.length / ITEMS_PER_PAGE)}
                      </span>
                      <button
                        onClick={() =>
                          setUnansweredPage((p) =>
                            Math.min(Math.ceil(unansweredQuestions.length / ITEMS_PER_PAGE), p + 1)
                          )
                        }
                        disabled={unansweredPage >= Math.ceil(unansweredQuestions.length / ITEMS_PER_PAGE)}
                        className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {learnedAnswers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">학습된 답변이 없습니다.</p>
                  ) : (
                    learnedAnswers
                      .slice((learnedPage - 1) * ITEMS_PER_PAGE, learnedPage * ITEMS_PER_PAGE)
                      .map((la) => (
                        <div
                          key={la.id}
                          className={`p-3 rounded-lg border ${
                            la.is_active ? "border-gray-200" : "border-gray-100 bg-gray-50"
                          }`}
                        >
                          <p className="font-medium text-gray-900">{la.question}</p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{la.answer}</p>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                            <span>사용: {la.usage_count}회</span>
                            <span>
                              {new Date(la.created_at).toLocaleDateString("ko-KR")}
                            </span>
                            <button
                              onClick={() => handleToggleActive(la.id)}
                              className={la.is_active ? "text-orange-500 hover:text-orange-700" : "text-green-500 hover:text-green-700"}
                            >
                              {la.is_active ? "비활성화" : "활성화"}
                            </button>
                            <button
                              onClick={() => handleDeleteAnswer(la.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
                {/* 학습된 답변 페이지네이션 */}
                {learnedAnswers.length > ITEMS_PER_PAGE && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-500">
                      {learnedAnswers.length}개 중 {(learnedPage - 1) * ITEMS_PER_PAGE + 1}-
                      {Math.min(learnedPage * ITEMS_PER_PAGE, learnedAnswers.length)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLearnedPage((p) => Math.max(1, p - 1))}
                        disabled={learnedPage === 1}
                        className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        이전
                      </button>
                      <span className="px-3 py-1 text-sm">
                        {learnedPage} / {Math.ceil(learnedAnswers.length / ITEMS_PER_PAGE)}
                      </span>
                      <button
                        onClick={() =>
                          setLearnedPage((p) =>
                            Math.min(Math.ceil(learnedAnswers.length / ITEMS_PER_PAGE), p + 1)
                          )
                        }
                        disabled={learnedPage >= Math.ceil(learnedAnswers.length / ITEMS_PER_PAGE)}
                        className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 오른쪽: 답변 입력 폼 */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">답변 추가</h2>
              <button
                onClick={() => {
                  setIsManualMode(!isManualMode);
                  setSelectedQuestion(null);
                  setManualQuestion("");
                  setAnswerText("");
                  setKeywords("");
                }}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  isManualMode
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isManualMode ? "직접 입력 모드" : "직접 입력"}
              </button>
            </div>

            {isManualMode ? (
              // 직접 입력 모드
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    질문 *
                  </label>
                  <textarea
                    value={manualQuestion}
                    onChange={(e) => setManualQuestion(e.target.value)}
                    placeholder="학습시킬 질문을 입력하세요..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    답변 *
                  </label>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="해당 질문에 대한 답변을 입력하세요..."
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    키워드 (쉼표로 구분, 선택)
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="예: 환불, 반품, 교환"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "저장 중..." : "학습 저장"}
                  </button>
                  <button
                    onClick={() => {
                      setIsManualMode(false);
                      setManualQuestion("");
                      setAnswerText("");
                      setKeywords("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : selectedQuestion ? (
              // 미답변 질문 선택 모드
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    선택된 질문
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {selectedQuestion.question}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    답변 *
                  </label>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="이 질문에 대한 답변을 입력하세요..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    키워드 (쉼표로 구분, 선택)
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="예: 환불, 반품, 교환"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "저장 중..." : "답변 저장"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedQuestion(null);
                      setAnswerText("");
                      setKeywords("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              // 기본 상태
              <div className="text-center py-12 text-gray-500">
                <p>왼쪽 목록에서 질문을 선택하거나</p>
                <p className="text-sm mt-2">
                  <button
                    onClick={() => setIsManualMode(true)}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    직접 입력
                  </button>
                  을 클릭하여 새로운 질문-답변을 추가하세요.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 통계 */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">{unansweredQuestions.length}</p>
            <p className="text-sm text-gray-500 mt-1">미답변 질문</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{learnedAnswers.filter(la => la.is_active).length}</p>
            <p className="text-sm text-gray-500 mt-1">활성 학습 답변</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {learnedAnswers.reduce((sum, la) => sum + la.usage_count, 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">총 사용 횟수</p>
          </div>
        </div>
      </main>
    </div>
  );
}

