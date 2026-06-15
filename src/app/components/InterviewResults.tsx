import { InterviewAnswer, InterviewQuestion } from "@/types/interview";

type Props = {
    answers: InterviewAnswer[];
    questions: InterviewQuestion[];
    averageScore: number;
    averageScoreColor: string;
    topStrengths: string[];
    topWeaknesses: string[];
};

export default function InterviewResults({ answers, questions, averageScore, averageScoreColor, topStrengths, topWeaknesses }: Props) {
    return (
        <div className="mt-6 bg-white border rounded-xl p-6 text-center max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-indigo-400">Interview Complete &#127881;</h2>
            <p className="text-gray-600 mt-2">Questions Answered: {answers.length - answers.filter(a => a.answer === "Skipped").length} / {questions.length}</p>

            <p className={`text-3xl font-bold mt-4 ${averageScoreColor}`}>{averageScore}/100</p>
            <p className="text-gray-500">Average Interview Score</p>
            <div className="mt-6 text-left">
                <h3 className="font-bold text-lg mb-2 text-slate-900">
                    Strength Areas
                </h3>
                <ul className="list-disc ml-5 text-green-600">
                    {topStrengths.length ? (topStrengths.map((strength, i) => <li key={i}>{strength}</li>)) : (<li>No major strengths identified</li>)}
                </ul>
            </div>

            <div className="mt-6 text-left">
                <h3 className="font-bold text-lg mb-2 text-slate-900">
                    Areas To Improve
                </h3>
                <ul className="list-disc ml-5 text-red-600">
                    {topWeaknesses.length  ? (topWeaknesses.map((weakness, i) => <li key={i}>{weakness}</li>)) : (<li>No major weaknesses identified</li>)}
                </ul>
            </div>
            <div>
                <button className="bg-lime-600 hover:bg-lime-700 p-2 border border-amber-400 rounded-2xl" onClick={() => window.location.reload()}>Start over</button>
            </div>
        </div>
    )
}