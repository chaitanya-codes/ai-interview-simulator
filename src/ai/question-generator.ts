import { groq } from "@/lib/groq";
import { ResumeProfile } from "@/types/resume";

import { z } from "zod";

const QuestionSchema = z.object({
    type: z.enum(["skill", "technology", "project"]),
    question: z.string(),
    difficulty: z.enum(["easy", "medium", "hard"]),
});

const ResponseSchema = z.object({
    questions: z.array(QuestionSchema),
});

export async function generateQuestions(resume: ResumeProfile) {
    const prompt = `
Generate 5 high-quality technical interview questions based on the candidate's resume.

---

RULES:
- Only use information present in the resume.
- Do not assume missing experience.
- Avoid generic questions.
- Make questions specific and realistic.
- At least one question must deeply explore a project.
- Vary difficulty based on experienceLevel:
  - student -> mostly easy
  - junior -> easy + medium mix
  - mid -> include at least one hard

---

OUTPUT FORMAT (STRICT JSON ONLY):

{
  "questions": [
    {
      "type": "skill" | "technology" | "project",
      "question": string,
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}

---

IMPORTANT:
- No markdown
- No explanation
- No extra text

Resume:
${JSON.stringify(resume, null, 2)}
`;

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
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
    
    const content = completion.choices[0].message.content ?? "";
    const parsed = JSON.parse(content);

    const result = ResponseSchema.safeParse(parsed);

    if (!result.success) {
        throw new Error("Invalid LLM response format");
    }

    return result.data.questions;
}