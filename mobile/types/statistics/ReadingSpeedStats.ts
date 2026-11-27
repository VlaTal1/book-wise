import {Participant} from "@/types/Paticipant";

export type ReadingSpeedStatsByParticipant = {
    participant: Participant;
    attemptsCount: number;
    averageWpm: number;
    averageAccuracy: number;
    averageStressAccuracy: number | null;
    stressCheckedAttemptsCount: number;
    averageGrade: number | null;
    gradedAttemptsCount: number;
    lastGrade: number | null;
    gradeTrend: number | null;
};
