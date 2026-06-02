"use client";

import { Feedback, InterviewAnswer, InterviewQuestion } from "@/types/interview";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[] | null>(null);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [currentQuesIndex, setCurrentQuesIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/analyze_resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(text);
        throw new Error("Request failed");
      }

      const data = await response.json();

      setQuestions(data.questions);
      setCurrentQuesIndex(0);
      setAnswers([]);
      setFeedback(null);
      setCurrentAnswer("");
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Failed to generate questions");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!questions?.[currentQuesIndex]) return;

    const currentQuestion = questions[currentQuesIndex];

    const answer: InterviewAnswer = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
    };

    setAnswers(prev => [...prev, answer]);

    const response = await fetch("/api/evaluate_answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: currentQuestion.question,
        answer: currentAnswer,
      }),
    });

    if (!response.ok) {
      setError("Failed to evaluate answer");
      return;
    }

    const data = await response.json();

    setFeedback(data.feedback);
    setCurrentAnswer("");
  }

  function handleNextQuestion() {
    setFeedback(null);
    setCurrentQuesIndex(idx => idx + 1);
  }

  function handleSkip() {
    if (!questions?.[currentQuesIndex]) return;

    setAnswers(prev => [...prev, {
      questionId: questions[currentQuesIndex].id,
      answer: "Skipped",
    },
    ]);

    setFeedback(null);
    setCurrentAnswer("");
    setCurrentQuesIndex(idx => idx + 1);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Interview Simulator</h1>

        <p className="text-gray-600 mb-8">Upload your resume and get AI-generated interview questions.</p>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-600" />

          <button onClick={handleUpload} disabled={!file || loading} className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50">
            {loading ? "Generating..." : "Generate Questions"}
          </button>

          {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
        </div>

        {loading && (
          <div className="mt-6 bg-white border rounded-xl p-6 text-center text-gray-600">
            <div className="animate-pulse">Generating interview questions...</div>
          </div>
        )}

        {!loading && !questions && <div className="mt-6 text-center text-gray-500">No questions yet. Upload a resume to begin.</div>}

        {questions?.[currentQuesIndex] && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-gray-500">
              Question {currentQuesIndex + 1} of {questions.length}
            </p>

            <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <p className="font-medium text-gray-900">{currentQuesIndex + 1}. {questions[currentQuesIndex].question}</p>

                <span className="text-xs mx-0.5 px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {questions[currentQuesIndex].difficulty}
                </span>
              </div>

              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full capitalize ${questions[currentQuesIndex].type === "skill" ? "bg-blue-100 text-blue-700" : questions[currentQuesIndex].type === "technology" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>
                {questions[currentQuesIndex].type}
              </span>
            </div>

            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer
              </label>

              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={!!feedback}
                placeholder="Explain your approach in detail..."
                className="w-full min-h-[180px] rounded-xl border border-gray-300 p-4 text-black resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500">
                  {currentAnswer.length} characters
                </span>

                <div className="flex gap-3">
                  {!feedback ? (
                    <>
                      <button onClick={handleSkip} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
                        Skip
                      </button>

                      <button onClick={handleSubmitAnswer} disabled={!currentAnswer.trim()} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                        Submit Answer
                      </button>
                    </>
                  ) : (
                    <button onClick={handleNextQuestion} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition">
                      Next Question &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>

            {feedback && (
              <div className="bg-white border rounded-xl p-5 text-black">
                <h3 className="font-bold mb-3">Score: {feedback.score}/100</h3>

                <div className="mb-3">
                  <p className="font-semibold">Strengths</p>
                  <ul className="list-disc ml-5">
                    {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div className="mb-3">
                  <p className="font-semibold">Weaknesses</p>
                  <ul className="list-disc ml-5">
                    {feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>

                <div>
                  <p className="font-semibold">Improvement</p>
                  <p>{feedback.improvement}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {questions && currentQuesIndex >= questions.length && (
          <div className="mt-6 bg-white border rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold">Interview Complete &#127881;</h2>
            <p className="text-gray-600 mt-2">You answered {answers.length} questions.</p>
          </div>
        )}
      </div>
    </main>
  );
}