import { groq } from "@/lib/groq";
import { ResumeProfile } from "@/types/resume";
import { z } from "zod";

export const ResumeProfileSchema = z.object({
    candidateName: z.string().optional(),

    skills: z.array(z.string()),

    technologies: z.array(z.string()),

    projects: z.array(z.string()),

    education: z.string().optional(),

    experienceLevel: z.enum([
        "student",
        "junior",
        "mid",
    ]),

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
Extract resume information.

Return valid JSON only.

{
  "candidateName": "",
  "skills": [],
  "technologies": [],
  "projects": [],
  "education": "",
  "experienceLevel": "",
  "summary": ""
}
`,
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