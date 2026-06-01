export const runtime = "nodejs";
import { generateQuestions } from "@/ai/question-generator";
import { parseResume } from "@/lib/pdf";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const file = formData.get("resume") as File;

        if (!file) {
            return NextResponse.json({
                error: "Resume required"
            }, {
                status: 400
            })
        }

        const bytes = await file.arrayBuffer();

        const buffer = Buffer.from(bytes);

        const resumeText = await parseResume(buffer);
        const questions = await generateQuestions(resumeText);

        return NextResponse.json({
            success: true,
            questions
        });
    } catch(error) {
        console.error(error);

        return NextResponse.json({
            error: "Failed to generate questions"
        }, {
            status: 500
        });
    }
}