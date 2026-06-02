import { evaluateAnswer } from "@/ai/answer_evaluator";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { question, answer } = await request.json();
        if (!question || !answer) {
            return NextResponse.json({ error: "Question and answer required" }, { status: 400 });
        }
        
        const feedback = await evaluateAnswer(question, answer);

        return NextResponse.json({ success: true, feedback });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to evaluate answer", }, { status: 500 });
    }
}