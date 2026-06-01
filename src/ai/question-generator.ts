import { groq } from "@/lib/groq";

export async function generateQuestions(resumeText: string) {
    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
            role: "system",
            content: "You are a senior software engineering interviewer.",
        },
        {
            role: "user",
            content: `
Based on this resume, generate 5 technical interview questions.
            
Resume:

${resumeText}

Return only the questions as a numbered list.
`,
        }
    ]
    });

    return completion.choices[0].message.content ?? ""
}