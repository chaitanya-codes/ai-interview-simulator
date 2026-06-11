import { groq } from "@/lib/groq";

export async function generateFollowUpQuestions(question: string, answer: string) {
    const prompt = `
You are a senior software engineering interviewer.

Original Question:
${question}

Candidate Answer:
${answer}

Generate ONE follow-up question.

Rules:
- Must be based on the candidate answer
- Dig deeper
- Challenge assumptions
- Ask for tradeoffs
- Ask why they chose something
- One sentence only

Return JSON:

{
  "question": "..."
}`

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        response_format: {
            type: "json_object"
        },
        messages: [{
            role: "system",
            content: "You are a senior FAANG-level software engineering interviewer who writes precise, structured interview questions.",
        },
        {
            role: "user",
            content: prompt
        }
        ]
    });

    const content = completion.choices[0].message.content;
    if (!content) {
        throw new Error("Question generation failed");
    }
    const result = JSON.parse(content);
    if (!result.question) {
        throw new Error("No follow-up question generated");
    }
    return result.question;
}