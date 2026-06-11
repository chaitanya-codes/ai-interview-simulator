import { generateFollowUpQuestions } from "@/ai/followup_generator";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { question, answer } = await request.json();
        if (!question || !answer) {
            return NextResponse.json({ error: "Question and answer required" }, { status: 400 });
        }
        
        const followUpQuestion = await generateFollowUpQuestions(question, answer);

        return NextResponse.json({ success: true, question: followUpQuestion });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to evaluate answer", }, { status: 500 });
    }
}