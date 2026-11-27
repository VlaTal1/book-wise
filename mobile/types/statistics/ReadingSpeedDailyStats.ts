export type ReadingSpeedDailyStats = {
    date: string;
    attemptsCount: number;
    averageWpm: number;
    averageAccuracy: number;
    averageStressAccuracy: number | null;
    averageGrade: number | null;
};
