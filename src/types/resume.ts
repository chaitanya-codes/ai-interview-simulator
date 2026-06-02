export interface ResumeProfile {
  candidateName?: string;
  skills: string[];
  technologies: string[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
  }[];
  education?: string;
  experienceLevel: "student" | "junior" | "mid" | "system-design";
  summary: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
}