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
    <main className="p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        AI Interview Simulator
      </h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) =>
          setFile(
            e.target.files?.[0] || null
          )
        }
      />

      <button
        onClick={handleUpload}
        className="ml-4 border px-4 py-2"
      >
        Generate Questions
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {loading && (
        <p className="mt-6">
          Generating...
        </p>
      )}

      {questions && (
        <div className="mt-6 space-y-4">
          {questions.map((q: any, i: number) => (
            <div key={i} className="border p-3 rounded">
              <p className="font-medium">
                {i + 1}. {q.question}
              </p>
              <p className="text-sm text-gray-500">
                {q.type} • {q.difficulty}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}