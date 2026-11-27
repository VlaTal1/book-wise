export type WordStatus = "correct" | "error" | "skipped" | "not_in_vocabulary" | "not_reached";

export interface ReferenceWord {
    index: number;
    word: string;
    in_vocabulary: boolean;
    display: string;
}

export interface ReferenceTextMessage {
    type: "reference";
    text_id: string;
    title: string;
    words: ReferenceWord[];
    time_limit_seconds?: number | null;
    assignment_id?: number | null;
}

export interface WordEventMessage {
    type: "word_event";
    index: number;
    status: WordStatus;
    tentative: boolean;
}

export interface ReadingSpeedMetrics {
    total_words: number;
    correct_count: number;
    error_count: number;
    skipped_count: number;
    not_in_vocabulary_count: number;
    duration_seconds: number;
    wpm: number;
    accuracy: number;
}

export interface ComprehensionQuizAnswer {
    answer: string;
    correct: boolean;
}

export interface ComprehensionQuizQuestion {
    question: string;
    quote: string;
    answers: ComprehensionQuizAnswer[];
}

export interface ResultMessage {
    type: "result";
    text_id: string;
    metrics: ReadingSpeedMetrics;
    attempt_id: number | null;
    quiz: ComprehensionQuizQuestion[] | null;
}

export interface ProcessingMessage {
    type: "processing";
}

export interface QuizMessage {
    type: "quiz";
    questions: ComprehensionQuizQuestion[];
}

export type ReadingSpeedServerMessage = ReferenceTextMessage | WordEventMessage | ProcessingMessage | QuizMessage | ResultMessage;

export type StressStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED" | "NOT_APPLICABLE";

export interface StressWordVerdict {
    index: number;
    word: string;
    checked: boolean;
    correct: boolean | null;
    predicted_syllable: number | null;
    reference_syllables: number[] | null;
}

export interface ReadingSpeedAttempt {
    id: number;
    participantId: number;
    participantName: string | null;
    textId: string;
    totalWords: number;
    correctCount: number;
    errorCount: number;
    skippedCount: number;
    notInVocabularyCount: number;
    durationSeconds: number;
    wpm: number;
    accuracy: number;
    wordsJson: string;
    referenceWordsJson: string | null;
    stressStatus: StressStatus;
    stressProgress: number | null;
    stressAccuracy: number | null;
    stressCheckedWords: number | null;
    stressCorrectWords: number | null;
    stressWordsJson: string | null;
    stressError: string | null;
    audioFileName: string | null;
    targetWpm: number | null;
    quizTotal: number | null;
    quizCorrect: number | null;
    grade: number | null;
    speedScore: number | null;
    pronunciationScore: number | null;
    comprehensionScore: number | null;
    classroomReadingTitle?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface WordEventRecord {
    index: number;
    status: WordStatus;
}
