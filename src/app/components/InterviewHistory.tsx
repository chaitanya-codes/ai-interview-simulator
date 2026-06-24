"use client";

import { useEffect, useState } from "react";

type InterviewHistoryItem = {
    id: string;
    date: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
};

export default function InterviewHistory() {
    const [history, setHistory] = useState<InterviewHistoryItem[]>([]);

    useEffect(() => {
        setHistory(JSON.parse(localStorage.getItem("interview-history") || "[]"));
    }, []);

    if (!history.length) return null;

    return (
        <div className="max-w-4xl mx-auto mt-6 rounded-2xl border border-cyan-500/10 bg-slate-950/95 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-4 text-slate-100">Interview History</h2>
            <div className="space-y-3">
                {history.map(item => (
                    <div key={item.id} className="rounded-xl border border-white/10 bg-white/3 p-4">
                        <div className="flex justify-between items-center">
                            <p className="text-slate-400">{item.date}</p>
                            <p className={`font-bold ${item.score >= 80 ? "text-cyan-400" : item.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                                {item.score}/100
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={() => { localStorage.removeItem("interview-history"); setHistory([]); }} className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-200/10 cursor-pointer px-4 py-2 text-red-400">
                Clear History
            </button>
        </div>
    );
}