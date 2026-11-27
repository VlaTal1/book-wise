package com.example.readerai.service;

import com.example.readerai.entity.ReadingSpeedAttempt;
import com.example.readerai.entity.StressStatus;

public final class ReadingGradeCalculator {

    public static final int COMPONENT_MAX = 4;
    public static final int GRADE_MAX = 3 * COMPONENT_MAX;

    static final double WORDS_WEIGHT = 0.7;
    static final double STRESS_WEIGHT = 0.3;

    static final double ACCURACY_ZERO = 0.60;
    static final double ACCURACY_FULL = 1.00;

    static final double STRESS_ZERO = 0.70;
    static final double STRESS_FULL = 0.95;

    static final int DEFAULT_TARGET_WPM = 70;

    private static final double EPS = 1e-9;

    public record Result(int speed, int pronunciation, Integer comprehension, int total) {
    }

    private ReadingGradeCalculator() {
    }

    public static Result calculate(ReadingSpeedAttempt attempt) {
        int targetWpm = attempt.getTargetWpm() != null && attempt.getTargetWpm() > 0
                ? attempt.getTargetWpm()
                : DEFAULT_TARGET_WPM;
        int speed = speedPoints(attempt.getWpm() / targetWpm);

        double words = scale(attempt.getAccuracy(), ACCURACY_ZERO, ACCURACY_FULL);
        double pronunciation = attempt.getStressStatus() == StressStatus.DONE && attempt.getStressAccuracy() != null
                ? WORDS_WEIGHT * words + STRESS_WEIGHT * scale(attempt.getStressAccuracy(), STRESS_ZERO, STRESS_FULL)
                : words;
        int pronunciationPoints = points(pronunciation);

        Integer comprehension = null;
        if (attempt.getQuizTotal() != null && attempt.getQuizTotal() > 0 && attempt.getQuizCorrect() != null) {
            comprehension = points((double) attempt.getQuizCorrect() / attempt.getQuizTotal());
        }

        int total = comprehension != null
                ? speed + pronunciationPoints + comprehension
                : (int) Math.round((speed + pronunciationPoints) * GRADE_MAX / (2.0 * COMPONENT_MAX));
        return new Result(speed, pronunciationPoints, comprehension, total);
    }

    public static void apply(ReadingSpeedAttempt attempt) {
        Result result = calculate(attempt);
        attempt.setSpeedScore(result.speed());
        attempt.setPronunciationScore(result.pronunciation());
        attempt.setComprehensionScore(result.comprehension());
        attempt.setGrade(result.total());
    }

    public static boolean isReady(ReadingSpeedAttempt attempt) {
        boolean stressFinished = attempt.getStressStatus() == StressStatus.DONE
                || attempt.getStressStatus() == StressStatus.FAILED
                || attempt.getStressStatus() == StressStatus.NOT_APPLICABLE;
        boolean quizFinished = attempt.getQuizTotal() == null
                || attempt.getQuizTotal() == 0
                || attempt.getQuizCorrect() != null;
        return stressFinished && quizFinished;
    }

    static int speedPoints(double share) {
        return (int) Math.floor(COMPONENT_MAX * Math.min(Math.max(share, 0), 1.0) + EPS);
    }

    private static int points(double share) {
        return (int) Math.round(COMPONENT_MAX * share);
    }

    private static double scale(double value, double zero, double full) {
        return Math.max(0, Math.min(1, (value - zero) / (full - zero)));
    }
}
