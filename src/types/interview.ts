export interface InterviewQuestion {
    id: string;
    type: "skill" | "technology" | "project";
    question: string;
    difficulty: "easy" | "medium" | "hard";
    context?: string;
}

export interface InterviewAnswer {
    questionId: string;
    answer: string;
    timeTaken?: number;
}

// export interface Feedback {
//     score: number;
//     strengths: string[];
//     weaknesses: string[];
//     improvement: string;
//     followUpSuggestions?: string[];
//     skillGaps?: string[];
// }

// export interface InterviewSession {
//     sessionId: string;
//     questions: InterviewQuestion[];
//     answers: InterviewAnswer[];
//     feedback?: Feedback;
//     currentIndex: number;
//     status: "not_started" | "in_progress" | "completed";
//     startedAt: Date;
//     endedAt?: Date;
// }