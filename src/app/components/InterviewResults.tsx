import { InterviewAnswer, InterviewQuestion } from "@/types/interview";
import CountUp from "react-countup";
import { downloadInterviewReport } from "@/utils/downloadInterviewReport";
import { Feedback } from "@/types/interview";

type Props = {
    answers: InterviewAnswer[];
    questions: InterviewQuestion[];
    averageScore: number;
    averageScoreColor: string;
    topStrengths: string[];
    topWeaknesses: string[];
    feedbacks: Feedback[];
};

export default function InterviewResults({ answers, questions, averageScore, averageScoreColor, topStrengths, topWeaknesses, feedbacks }: Props) {
    return (
        <div className="mt-6 max-w-4xl mx-auto rounded-2xl border border-cyan-500/10 bg-slate-950/95 p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,.08)]">

            <h2 className="text-3xl font-bold text-center bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Interview Complete 🎉</h2>
            <p className="mt-2 text-center text-slate-400">Questions Answered: {answers.length - answers.filter(a => a.answer === "Skipped").length} / {questions.length}</p>

            <p className={`text-5xl font-bold mt-6 text-center ${averageScoreColor}`}><CountUp end={averageScore} duration={1.5} />/100</p>

            <p className="text-slate-500 text-center mt-2">Average Interview Score</p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
                    <h3 className="font-bold text-lg mb-3 text-green-400">Strength Areas</h3>

                    <ul className="list-disc ml-5 text-slate-300">
                        {topStrengths.length ? (topStrengths.map((strength, i) => <li key={i}>{strength}</li>)) : (<li>No major strengths identified</li>)}
                    </ul>
                </div>
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                    <h3 className="font-bold text-lg mb-3 text-red-400">Areas To Improve</h3>

                    <ul className="list-disc ml-5 text-slate-300">
                        {topWeaknesses.length ? (topWeaknesses.map((weakness, i) => <li key={i}>{weakness}</li>)) : (<li>No major weaknesses identified</li>)}
                    </ul>
                </div>
            </div>
            <div className="flex gap-3 mt-8">
                <button className="flex-1 rounded-xl bg-cyan-500 py-3 font-medium text-black hover:bg-cyan-400 transition" onClick={() => downloadInterviewReport({ averageScore, topStrengths, topWeaknesses, answers, questions, feedbacks})}>
                    Download PDF
                </button>
                <button className="flex-1 rounded-xl bg-slate-700 py-3 font-medium text-white hover:bg-slate-600 transition" onClick={() => window.location.reload()}>
                    Start Over
                </button>
            </div>
        </div>
    );
}