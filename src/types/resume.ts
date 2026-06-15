export interface ResumeProfile {
  candidateName?: string;
  skills: string[];
  technologies: string[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
  }[];
  education?: string[];
  experienceLevel: "student" | "junior" | "mid" | "system-design";
  summary: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
}