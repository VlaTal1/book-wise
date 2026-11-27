import {ReadingSpeedAttempt} from "@/types/ReadingSpeed";

export const GRADE_MAX = 12;
export const GRADE_COMPONENT_MAX = 4;

export type GradeScores = Pick<ReadingSpeedAttempt, "grade" | "speedScore" | "pronunciationScore" | "comprehensionScore" | "targetWpm">;

export const pickGradeScores = (attempt: ReadingSpeedAttempt): GradeScores => ({
    grade: attempt.grade,
    speedScore: attempt.speedScore,
    pronunciationScore: attempt.pronunciationScore,
    comprehensionScore: attempt.comprehensionScore,
    targetWpm: attempt.targetWpm,
});

export const formatGrade = (grade: number) => `${grade}/${GRADE_MAX}`;

export const gradeColors = (grade: number) => {
    if (grade >= 9) {
        return {bg: "#E7F3EA", text: "#2F6B45"};
    }
    if (grade >= 5) {
        return {bg: "#FBF1DC", text: "#8A6416"};
    }
    return {bg: "#FBEAE8", text: "#C1443A"};
};
