"use client";

import { Feedback, InterviewAnswer, InterviewQuestion } from "@/types/interview";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[] | null>(null);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [currentQuesIndex, setCurrentQuesIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [interviewState, setInterviewState] = useState<"speaking" | "listening" | "idle">("idle");
  const [blobIntensity, setBlobIntensity] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const hasSpokenRef = useRef(false);

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

      window.scrollTo({ top: 400, behavior: "smooth" });
      setQuestions(data.questions);
      setCurrentQuesIndex(0);
      setAnswers([]);
      setFeedback(null);
      setFeedbacks([]);
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
      isFollowUp,
      answer: currentAnswer,
    };

    setAnswers(prev => [...prev, answer]);

    const response = await fetch("/api/evaluate_answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: activeQuestionText,
        answer: currentAnswer,
      }),
    });

    if (!response.ok) {
      setError("Failed to evaluate answer");
      return;
    }

    const data = await response.json();

    const generateFollowUp = Math.random() < 0.7;
    if (!isFollowUp) {
      setFeedback(data.feedback);
      setFeedbacks(prev => [...prev, data.feedback]);
    }

    if (!isFollowUp && generateFollowUp) {
      const followUpResponse = await fetch("/api/generate_followup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: activeQuestionText,
          answer: currentAnswer,
        }),
      }
      );
      const followUpData = await followUpResponse.json();
      setFollowUpQuestion(followUpData.question);
      setIsFollowUp(true);
      hasSpokenRef.current = false;
    } else if (isFollowUp) {
      setFeedbacks(prev => {
        const updated = [...prev];
        if (updated.length === 0) return updated;
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          score: Math.round(updated[updated.length - 1].score * 0.7 + data.feedback.score * 0.3)
        }
        return updated;
      });
      setTimeout(() => {
        handleNextQuestion();
      }, 2000);
    }

    setCurrentAnswer("");
    stopListening();
  }

  function handleNextQuestion() {
    setFeedback(null);
    setFollowUpQuestion(null);
    setIsFollowUp(false);
    hasSpokenRef.current = false;
    setCurrentQuesIndex(idx => idx + 1);
    window.speechSynthesis.cancel();
    if (currentQuesIndex + 1 >= questions!.length) setInterviewState("idle");
  }

  function handleSkip() {
    if (!questions?.[currentQuesIndex]) return;

    setAnswers(prev => [...prev, {
      questionId: questions[currentQuesIndex].id,
      answer: "Skipped",
    },
    ]);
    if (isFollowUp) {
      setIsFollowUp(false);
      setFollowUpQuestion(null);
    }
    hasSpokenRef.current = false;
    setFeedback(null);
    setCurrentAnswer("");
    setCurrentQuesIndex(idx => idx + 1);
    window.speechSynthesis.cancel();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];

    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
    }
  }

  function getTopItems(items: string[], count = 3) {
    const map = new Map<string, number>();

    items.forEach(item => {
      map.set(item, (map.get(item) ?? 0) + 1);
    });

    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, count).map(([item]) => item);
  }
  const recognitionRef = useRef<any>(null);

  function startListening() {
    const SpeechRecognition = (window as any)?.SpeechRecognition || (window as any)?.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setInterviewState("listening");
      };

      recognition.onend = () => {
        setInterviewState("idle");
      };

      recognition.onerror = (e: any) => {
        console.error(e);
        setInterviewState("idle");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer(prev => prev + transcript);
      };

      recognitionRef.current = recognition;
    }
    try {
      recognitionRef.current.start();
    } catch { }
  }
  function stopListening() {
    recognitionRef.current?.stop();
  }

  const averageScore = feedbacks.length > 0 ? Math.round(feedbacks.reduce((total, feedback) => total + feedback.score, 0) / feedbacks.length) : 0;
  const scoreColor = feedback ? feedback.score >= 80 ? "text-green-600" : feedback.score >= 60 ? "text-yellow-600" : "text-red-600" : "text-slate-600";
  const averageScoreColor = averageScore >= 80 ? "text-green-600" : averageScore >= 60 ? "text-yellow-600" : "text-red-600";
  const allStrengths = feedbacks.flatMap(feedback => feedback.strengths);
  const allWeaknesses = feedbacks.flatMap(feedback => feedback.weaknesses);
  const topStrengths = getTopItems(allStrengths);
  const topWeaknesses = getTopItems(allWeaknesses);
  const activeQuestionText = isFollowUp ? followUpQuestion : questions?.[currentQuesIndex]?.question;

  useEffect(() => {
    if (!questions?.[currentQuesIndex]) return;
    setDisplayedText("");
    let interval: NodeJS.Timeout;

    if (!activeQuestionText) return;
    if (hasSpokenRef.current) return;
    hasSpokenRef.current = true;

    const utterance = new SpeechSynthesisUtterance(activeQuestionText);
    utterance.onstart = () => {
      let i = 0;
      interval = setInterval(() => {
        i++;
        setDisplayedText(activeQuestionText.slice(0, i));
        if (i >= activeQuestionText.length) clearInterval(interval);
      }, 45 + (Math.random() * 15));
      setInterviewState("speaking");
    }
    utterance.onend = () => {
      setInterviewState("listening");
      startListening();
    }
    utterance.onboundary = (e) => {
      setBlobIntensity(Math.random());
    };
    const voices = window?.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.name.startsWith("Microsoft Zira")) || null;
    window.speechSynthesis.cancel();
    utterance.volume = 0.6;
    utterance.rate = 1.5;
    window.speechSynthesis.speak(utterance);
    return () => {
      clearInterval(interval);
    };
  }, [currentQuesIndex, questions, isFollowUp, followUpQuestion]);

  useEffect(() => {
    window.scrollBy({ top: window.innerHeight * 0.6, behavior: "smooth" });
  }, [interviewState]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Escape") window.speechSynthesis.cancel();
      if (e.code.toLowerCase() === "p") {
        e.preventDefault();
        window.speechSynthesis.paused ? window.speechSynthesis.resume() : window.speechSynthesis.pause();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <main className="min-h-screen p-6 flex justify-center from-slate-600 to-slate-100 bg-linear-to-tr">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Interview Simulator</h1>

        <p className="text-slate-600 mb-8">Upload your resume and get AI-generated interview questions.</p>

        {!questions && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition ${dragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 bg-white"
                }`}
            >
              <input
                id="resume-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              <label htmlFor="resume-upload" className="cursor-pointer">
                {file ? (
                  <div>
                    <p className="font-medium text-green-600">&#10003; {file.name}</p>
                    <p className="text-sm text-slate-500">Click or drop different PDF</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-slate-600">Drag & Drop Resume Here</p>
                    <p className="text-sm text-slate-500">or click to browse</p>
                  </div>
                )}
              </label>
            </div>
            <button onClick={handleUpload} disabled={!file || loading} hidden={loading} className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50">
              {loading ? "Generating..." : "Generate Questions"}
            </button>

            {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
          </div>
        )}

        {loading && (
          <div className="mt-6 bg-cyan-300 border rounded-xl p-6 text-center text-slate-600">
            <div className="animate-pulse">Generating interview questions...</div>
          </div>
        )}

        {!loading && !questions && <div className="mt-6 text-center text-slate-100">No questions yet. Upload a resume to begin.</div>}

        {questions?.[currentQuesIndex] && (
          <div className="mt-6 space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-2300" style={{ width: `${((currentQuesIndex + 1) / questions.length) * 100}%` }} />
            </div>
            <p className="text-sm text-slate-500 inline">
              Question {currentQuesIndex + 1} / {questions.length}
            </p>

            <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col items-center">
                <p className="mb-3 text-xs uppercase tracking-wider text-slate-400">AI Interviewer</p>
                <div style={{ transform: `scale(${0.8 + blobIntensity * 0.25})`, transition: "transform 120ms linear" }}>
                  <div className={`ai-orb ${interviewState === "speaking" ? "speaking" : interviewState === "listening" ? "listening" : ""}`} />
                </div>
                <p className="font-medium text-slate-900">
                  {displayedText ? isFollowUp ? `Follow-up: ${displayedText}` : `${currentQuesIndex + 1}. ${displayedText}` : ""}
                  <span className="text-blue-500 font-light">▋</span>
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full capitalize ${questions[currentQuesIndex].type === "skill" ? "bg-blue-100 text-blue-700" : questions[currentQuesIndex].type === "technology" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>
                  {questions[currentQuesIndex].type}
                </span>
                <span className="text-xs mx-0.5 px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                  {questions[currentQuesIndex].difficulty}
                </span>
              </div>
            </div>
            {interviewState !== "speaking" && (
              <div className="bg-white border rounded-xl p-5 shadow-sm">
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Answer</label>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  disabled={!!feedback && !isFollowUp}
                  placeholder="Explain your approach in detail..."
                  className="w-full min-h-45 rounded-xl border border-slate-300 p-4 text-black resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-slate-500">
                    {currentAnswer.length} characters
                  </span>

                  <div className="flex gap-3">
                    {!feedback ? (
                      <>
                        <button onClick={handleSkip} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition">
                          Skip
                        </button>
                        <button onClick={handleSubmitAnswer} disabled={!currentAnswer.trim()} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                          Submit Answer
                        </button>
                      </>
                    ) : (isFollowUp ? (
                      <button disabled={!currentAnswer.trim()} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition" onClick={() => {
                        setIsFollowUp(false);
                        setFollowUpQuestion(null);
                        hasSpokenRef.current = true;
                        window.scrollBy({ top: 800, behavior: "smooth" });
                      }}>
                        Follow Up &rarr;
                      </button>
                    ) : (
                      <button onClick={handleNextQuestion} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition">
                        Next Question &rarr;
                      </button>
                    )
                    )}
                  </div>
                </div>
              </div>
            )}
            {(feedback && !isFollowUp) && (
              <div className={`bg-white border rounded-xl p-5 ${scoreColor} shadow-sm`}>
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
            <h2 className="text-2xl font-bold text-indigo-400">Interview Complete &#127881;</h2>

            <p className="text-gray-600 mt-2">Questions Answered: {answers.length - answers.filter(a => a.answer === "Skipped").length} / {questions.length}</p>

            <p className={`text-3xl font-bold mt-4 ${averageScoreColor}`}>{averageScore}/100</p>
            <p className="text-gray-500">Average Interview Score</p>
            <div className="mt-6 text-left">
              <h3 className="font-bold text-lg mb-2 text-slate-900">
                Strength Areas
              </h3>

              <ul className="list-disc ml-5 text-green-600">
                {topStrengths.map((strength, i) => (
                  <li key={i}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 text-left">
              <h3 className="font-bold text-lg mb-2 text-slate-900">
                Areas To Improve
              </h3>

              <ul className="list-disc ml-5 text-red-600">
                {topWeaknesses.map((weakness, i) => (
                  <li key={i}>{weakness}</li>
                ))}
              </ul>
            </div>
            <div>
              <button className="bg-lime-600 hover:bg-lime-700 p-2 border border-amber-400 rounded-2xl" onClick={() => window.location.reload()}>Start over</button>
            </div>
          </div>
        )}
      </div>
    </main >
  );
}