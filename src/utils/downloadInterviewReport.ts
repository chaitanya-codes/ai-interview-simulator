import jsPDF from "jspdf";
import { Feedback, InterviewAnswer, InterviewQuestion } from "@/types/interview";

type Props = {
    averageScore: number;
    topStrengths: string[];
    topWeaknesses: string[];
    answers: InterviewAnswer[];
    questions: InterviewQuestion[];
    feedbacks: Feedback[];
};

export function downloadInterviewReport({ averageScore, topStrengths, topWeaknesses, answers, questions, feedbacks }: Props) {
    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(20);
    doc.text("AI Interview Report", 20, y);

    y += 15;

    doc.setFontSize(12);
    doc.text(`Average Score: ${averageScore}/100`, 20, y);

    y += 15;

    doc.setFontSize(14);
    doc.text("Strengths", 20, y);

    y += 8;

    topStrengths.forEach(strength => {
        doc.text(`• ${strength}`, 25, y);
        y += 7;
    });

    y += 5;

    doc.text("Areas To Improve", 20, y);

    y += 8;

    topWeaknesses.forEach(weakness => {
        doc.text(`• ${weakness}`, 25, y);
        y += 7;
    });

    y += 10;

    doc.text("Question Breakdown", 20, y);

    y += 10;

    questions.forEach((question, index) => {
        const feedback = feedbacks[index];

        if (y > 260) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(12);
        doc.text(`${index + 1}. ${question.question}`, 20, y);

        y += 7;

        doc.setFontSize(10);

        const answer = answers[index]?.answer ?? "Skipped";

        const wrappedAnswer = doc.splitTextToSize(`Answer: ${answer}`, 160);
        doc.text(wrappedAnswer, 25, y);

        y += wrappedAnswer.length * 5 + 2;

        if (feedback) {
            doc.text(`Score: ${feedback.score}/100`, 25, y);
            y += 6;
        }

        y += 4;
    });

    doc.save("interview-report.pdf");
}