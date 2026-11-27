export type ReadingMode = "FIXED" | "RANDOM";

export type ClassroomReading = {
    id: number;
    classroomId: number;
    name: string | null;
    mode: ReadingMode;
    bookId: number;
    bookTitle: string;
    startPage: number | null;
    endPage: number | null;
    wordCount: number | null;
    preview: string | null;
    timeLimitSeconds: number | null;
    maxAttempts: number | null;
    studentsCount?: number | null;
    completedCount?: number | null;
    attemptsUsed?: number | null;
    bestGrade?: number | null;
}

export type ClassroomReadingRequest = {
    mode: ReadingMode;
    name?: string;
    bookId: number;
    startPage?: number;
    endPage?: number;
    startParagraph?: number;
    endParagraph?: number;
    timeLimitSeconds: number | null;
    maxAttempts: number | null;
}

export type StudentReadingResult = {
    participantId: number;
    participantName: string;
    attemptsCount: number;
    bestGrade: number | null;
    bestAttemptId: number | null;
    bestWpm: number | null;
    bestSpeedScore?: number | null;
    bestPronunciationScore?: number | null;
    bestComprehensionScore?: number | null;
    bestAccuracy?: number | null;
    bestQuizTotal?: number | null;
    bestQuizCorrect?: number | null;
    gradePending: boolean;
}

export type ClassroomReadingResults = {
    reading: ClassroomReading;
    students: StudentReadingResult[];
}
