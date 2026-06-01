"use client";
import { InterviewQuestion } from "@/types/interview";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[] | null>(null);
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
      }
      );
      if (!response.ok) {
        const text = await response.text();
        console.error(text);
        throw new Error("Request failed");
      }

      const data = await response.json();

      setQuestions(data.questions);
      setError(null);
    } catch (error) {
      setError("Failed to generate questions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          AI Interview Simulator
        </h1>
        <p className="text-gray-600 mb-8">
          Upload your resume and get AI-generated interview questions.
        </p>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-600"
          />

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Questions"}
          </button>

          {error && (
            <p className="text-red-500 mt-3 text-sm">
              {error}
            </p>
          )}
        </div>

        {loading && (
          <div className="mt-6 bg-white border rounded-xl p-6 text-center text-gray-600">
            <div className="animate-pulse">
              Generating interview questions...
            </div>
          </div>
        )}

        {!loading && !questions && (
          <div className="mt-6 text-center text-gray-500">
            No questions yet. Upload a resume to begin.
          </div>
        )}

        {questions && (
          <div className="mt-6 space-y-4">
            {questions.map((q, i) => (
              <div
                key={i}
                className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <p className="font-medium text-gray-900">
                    {i + 1}. {q.question}
                  </p>

                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    {q.difficulty}
                  </span>
                </div>

                <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full capitalize ${q.type === "skill" ? "bg-blue-100 text-blue-700" : q.type === "technology" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>
                  {q.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}