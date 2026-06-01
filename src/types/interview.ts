
export interface InterviewQuestion {
    id: string;
    question: string;
}

export interface InterviewAnswer {
    questionId: string;
    answer: string;
}

export interface Feedback {
    score: number;
    strengths: string[];
    weaknesses: string[];
    improvement: string;
}