import { groq } from "@/lib/groq";
import { ResumeProfile } from "@/types/resume";
import { z } from "zod";

export const ResumeProfileSchema = z.object({
    candidateName: z.string().optional(),
    skills: z.array(z.string()),
    technologies: z.array(z.string()),
    projects: z.array(
        z.object({
            name: z.string(),
            description: z.string(),
            technologies: z.array(z.string()),
        })
    ),
    education: z.string().optional(),
    experienceLevel: z.enum([
        "student",
        "junior",
        "mid",
    ]).catch("student"),
    summary: z.string(),
});

export async function analyzeResume(resumeText: string): Promise<ResumeProfile> {
    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        response_format: {
            type: "json_object"
        },
        messages: [{
            role: "system",
            content: `
You are a strict resume parsing engine.

Extract structured data from the resume.

RULES:
- Return ONLY valid JSON
- Do NOT include markdown, text, or explanation
- Use empty arrays if data is missing
- Do NOT guess or invent information

OUTPUT SCHEMA:
{
  "candidateName": string,
  "skills": string[],
  "technologies": string[],
  "projects": [
    {
      "name": string,
      "description": string,
      "technologies": string[]
    }
  ],
  "education": string,
  "experienceLevel": "student" | "junior" | "mid",
  "summary": string
}
`
        },
        {
            role: "user",
            content: resumeText
        }
        ]
    });

    const content = completion.choices[0].message.content;
    if (!content) {
        throw new Error("Resume analysis failed");
    }

    const raw = JSON.parse(content);
    const profile = ResumeProfileSchema.parse(raw);

    return profile;
}