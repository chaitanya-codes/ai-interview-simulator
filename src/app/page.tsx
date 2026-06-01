"use client";
import { useState } from "react";


export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;

    setLoading(true);

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

    setLoading(false);
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

      {loading && (
        <p className="mt-6">
          Generating...
        </p>
      )}

      {questions && (
        <pre className="mt-6 whitespace-pre-wrap">
          {questions}
        </pre>
      )}
    </main>
  );
}