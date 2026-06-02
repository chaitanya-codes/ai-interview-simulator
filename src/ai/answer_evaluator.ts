import { groq } from "@/lib/groq";
import { Feedback } from "@/types/interview";
import { z } from "zod";

export const FeedbackSchema = z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    improvement: z.string(),
})

export async function evaluateAnswer(question: string, answer: string): Promise<Feedback> {
    const prompt = `
You are a senior software engineering interviewer.

Evaluate the candidate's answer to the interview question.

Score from 0 to 100.

Consider:
- Technical accuracy
- Completeness
- Depth of understanding
- Communication clarity

Return ONLY valid JSON:

{
  "score": number,
  "strengths": string[],
  "weaknesses": string[],
  "improvement": string
}
`;

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        response_format: {
            type: "json_object"
        },
        messages: [{
            role: "system",
            content: prompt
        }, {
            role: "user",
            content: `Question: ${question}\nAnswer: ${answer}`
        }]
    });

    const raw = completion.choices[0].message.content;
    if (!raw) {
        throw new Error("Answer evaluation failed");
    }
    try {
        const feedback = FeedbackSchema.parse(JSON.parse(raw));
        return feedback;
    } catch (error) {
        console.error("Failed to parse feedback:", error, "Raw response:", raw);
        throw new Error("Invalid feedback format");
    }
}