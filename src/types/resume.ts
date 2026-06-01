export interface ResumeProfile {
  candidateName?: string;
  skills: string[];
  technologies: string[];
  projects: string[];
  education?: string;
  experienceLevel: "student" | "junior" | "mid";
  summary: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
}