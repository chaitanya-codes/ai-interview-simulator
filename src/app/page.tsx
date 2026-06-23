"use client";

import { Feedback, InterviewAnswer, InterviewQuestion } from "@/types/interview";
import { useState, useEffect, useRef } from "react";
import ResumeAnalysisCard from "./components/ResumeAnalysisCard";
import { ResumeProfile } from "@/types/resume";
import ResumeUploader from "./components/ResumeUploader";
import InterviewResults from "./components/InterviewResults";

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
  const [resumeProfile, setResumeProfile] = useState<ResumeProfile | null>(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const hasSpokenRef = useRef(false);
  const transcriptRef = useRef("");

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
      setResumeProfile(data.profile);
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

    const generateFollowUp = Math.random() < 0.65;
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
      setCurrentAnswer("");
      transcriptRef.current = "";
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
    setCurrentAnswer("");
    transcriptRef.current = "";
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
        if (e.error === "no-speech") {
          try {
            recognition.start();
          } catch { }
          return;
        }

        if (e.error === "not-allowed") {
          alert("Microphone permission denied. Please allow microphone access.");
          return;
        }
        console.error(e);

        setInterviewState("idle");
      };

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcriptRef.current +=
              event.results[i][0].transcript + " ";
          }
        }

        setCurrentAnswer(transcriptRef.current);
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
  const scoreColor = feedback ? feedback.score >= 80 ? "text-cyan-400" : feedback.score >= 60 ? "text-yellow-400" : "text-red-400" : "text-slate-400";
  const averageScoreColor = averageScore >= 80 ? "text-cyan-400" : averageScore >= 60 ? "text-yellow-400" : "text-red-400";
  const allStrengths = feedbacks.flatMap(feedback => feedback.strengths);
  const allWeaknesses = feedbacks.flatMap(feedback => feedback.weaknesses);
  const topStrengths = getTopItems(allStrengths);
  const topWeaknesses = getTopItems(allWeaknesses);
  const activeQuestionText = isFollowUp ? followUpQuestion : questions?.[currentQuesIndex]?.question;

  useEffect(() => {
    if (!questions?.[currentQuesIndex] || !interviewStarted) return;
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
  }, [currentQuesIndex, questions, isFollowUp, followUpQuestion, interviewStarted]);

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
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex justify-center">      <div className="w-full max-w-6xl">
      <h1 className="mb-2 text-4xl font-bold bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">AI Interview Simulator</h1>

      <p className="mb-8 text-slate-400">Upload your resume and get AI-generated interview questions.</p>

      {!questions && (
        <ResumeUploader file={file} setFile={setFile} onDrop={handleDrop} onUpload={handleUpload} dragging={dragging} setDragging={setDragging} error={error} loading={loading} />
      )}

      {loading && (
        <div className="mt-6 max-w-3xl mx-auto rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 text-center text-cyan-300 backdrop-blur-xl">
          <div className="animate-pulse">Analyzing resume...</div>
        </div>
      )}

      {!loading && !questions && <div className="mt-6 text-center text-slate-100">No questions yet. Upload a resume to begin.</div>}

      {resumeProfile && !interviewStarted && (
        <ResumeAnalysisCard profile={resumeProfile} onStart={() => setInterviewStarted(true)} />
      )}

      {interviewStarted && questions?.[currentQuesIndex] && (
        <div className="mt-6 space-y-4 max-w-4xl mx-auto">
          <div className="w-full h-2 rounded-full bg-slate-800">
            <div className="h-2 rounded-full bg-linear-to-r from-cyan-400 to-purple-500 transition-all duration-700" style={{ width: `${((currentQuesIndex + 1) / questions.length) * 100}%` }} />
          </div>
          <p className="text-sm text-slate-500 inline">
            Question {currentQuesIndex + 1} / {questions.length}
          </p>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl transition hover:border-cyan-500/30">
            <div className="flex flex-col items-center">
              <p className="mb-3 text-xs uppercase tracking-wider text-cyan-400">AI Interviewer</p>
              <div style={{ transform: `scale(${0.8 + blobIntensity * 0.25})`, transition: "transform 120ms linear" }}>
                <div className={`ai-orb mb-5 ${interviewState === "speaking" ? "speaking" : interviewState === "listening" ? "listening" : ""}`} />
              </div>
              <p className="font-medium text-slate-100">
                {displayedText ? isFollowUp ? `Follow-up: ${displayedText}` : `${currentQuesIndex + 1}. ${displayedText}` : ""}
                <span className="text-cyan-400 font-light">▋</span>
              </p>
            </div>
            <div className="flex justify-between items-center">
              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full capitalize ${questions[currentQuesIndex].type === "skill" ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" : questions[currentQuesIndex].type === "technology" ? "bg-green-500/10 text-green-300 border border-green-500/20" : "bg-purple-500/10 text-purple-300 border border-purple-500/20"}`}>
                {questions[currentQuesIndex].type}
              </span>
              <span className="text-xs mx-0.5 px-2 py-1 rounded-full bg-white/3 border border-white/10 text-slate-400">
                {questions[currentQuesIndex].difficulty}
              </span>
            </div>
          </div>
          {interviewState !== "speaking" && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl">
              <label className="block text-sm font-medium text-slate-300 mb-2">Your Answer</label>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={!!feedback && !isFollowUp}
                placeholder="Explain your approach in detail..."
                className="w-full min-h-45 rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                autoFocus
              />
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-slate-500">
                  {currentAnswer.length} characters
                </span>

                <div className="flex gap-3">
                  {!feedback ? (
                    <>
                      <button onClick={handleSkip} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition">
                        Skip
                      </button>
                      <button onClick={handleSubmitAnswer} disabled={!currentAnswer.trim()} className="px-4 py-2 rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition">
                        Submit Answer
                      </button>
                    </>
                  ) : (isFollowUp ? (
                    <button disabled={!currentAnswer.trim()} className="px-4 py-2 rounded-lg bg-purple-600 text-black hover:bg-purple-700 transition" onClick={() => {
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
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl">
              <h3 className={`font-bold mb-3 ${scoreColor}`}>Score: {feedback.score}/100</h3>

              <div className="mb-3">
                <p className="font-semibold text-green-400">Strengths</p>
                <ul className="list-disc ml-5">
                  {feedback.strengths.length ? feedback.strengths.map((s, i) => <li key={i}>{s}</li>) : <p>-</p>}
                </ul>
              </div>

              <div className="mb-3">
                <p className="font-semibold text-red-400">Weaknesses</p>
                <ul className="list-disc ml-5">
                  {feedback.weaknesses.length ? feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>) : <p>-</p>}
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
        <InterviewResults answers={answers} averageScore={averageScore} averageScoreColor={averageScoreColor} questions={questions} topStrengths={topStrengths} topWeaknesses={topWeaknesses} />
      )}
    </div>
    </main >
  );
}