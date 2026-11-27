import React, {useEffect, useRef, useState} from "react";
import {ActivityIndicator, ScrollView} from "react-native";
import {XStack, YStack} from "tamagui";
import {useBackHandler} from "@react-native-community/hooks";
import {useRouter} from "expo-router";

import CustomStackScreen from "@/components/CustomStackScreen";
import Header from "@/components/Header";
import HeaderButton from "@/components/buttons/HeaderButton";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import {CustomText} from "@/components/CustomText";
import {ComprehensionQuiz} from "@/components/readingSpeed/ComprehensionQuiz";
import {HighlightedWordText} from "@/components/readingSpeed/HighlightedWordText";
import i18n from "@/localization/i18n";
import {useRole} from "@/hooks/roleContext";
import {requestMicrophonePermission, startAudioStream, stopAudioStream} from "@/services/audioStreamRecorder";
import {ReadingSpeedConnectError, ReadingSpeedSocket} from "@/services/readingSpeedSocket";
import classroomReadingApi from "@/api/endpoints/classroomReadingApi";
import {ClassroomReading} from "@/types/ClassroomReading";
import {StudentReadingCard} from "@/components/readingSpeed/StudentReadingCard";
import readingSpeedAttemptApi from "@/api/endpoints/readingSpeedAttemptApi";
import {ComprehensionQuizQuestion, ReadingSpeedMetrics, ReferenceWord, StressStatus, WordStatus} from "@/types/ReadingSpeed";
import {formatGrade, GradeScores, pickGradeScores} from "@/constants/readingGrade";
import {MetricLine, ScoreSection} from "@/components/readingSpeed/ScoreSection";

const STRESS_POLL_INTERVAL_MS = 3000;
const STRESS_TERMINAL_STATUSES: StressStatus[] = ["DONE", "FAILED", "NOT_APPLICABLE"];

const READING_TIME_LIMIT_SECONDS = 60;

type Phase = "idle" | "connecting" | "reading" | "processing" | "quiz" | "finished";

const ReadingSpeed = () => {
    const router = useRouter();
    const {studentId} = useRole();

    const [phase, setPhaseState] = useState<Phase>("idle");
    const phaseRef = useRef<Phase>("idle");
    const setPhase = (next: Phase) => {
        phaseRef.current = next;
        setPhaseState(next);
    };
    const [referenceWords, setReferenceWords] = useState<ReferenceWord[]>([]);
    const [referenceTitle, setReferenceTitle] = useState("");
    const [statuses, setStatuses] = useState<Record<number, WordStatus>>({});
    const [tentativeStatuses, setTentativeStatuses] = useState<Record<number, WordStatus>>({});
    const [metrics, setMetrics] = useState<ReadingSpeedMetrics | null>(null);
    const [quiz, setQuiz] = useState<ComprehensionQuizQuestion[] | null>(null);
    const [quizScore, setQuizScore] = useState<number | null>(null);
    const resultReceivedRef = useRef(false);
    const quizReceivedRef = useRef(false);
    const socketClosedRef = useRef(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [stressStatus, setStressStatus] = useState<StressStatus | null>(null);
    const [stressProgress, setStressProgress] = useState<number | null>(null);
    const [stressAccuracy, setStressAccuracy] = useState<number | null>(null);
    const [gradeScores, setGradeScores] = useState<GradeScores | null>(null);
    const grade = gradeScores?.grade ?? null;
    const [quizSubmitted, setQuizSubmitted] = useState(false);

    const [secondsLeft, setSecondsLeft] = useState(READING_TIME_LIMIT_SECONDS);
    const [timeLimit, setTimeLimit] = useState<number | null>(READING_TIME_LIMIT_SECONDS);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [assignments, setAssignments] = useState<ClassroomReading[]>([]);
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);

    const socketRef = useRef<ReadingSpeedSocket | null>(null);
    const stressPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const readingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopStressPolling = () => {
        if (stressPollRef.current) {
            clearInterval(stressPollRef.current);
            stressPollRef.current = null;
        }
    };

    const stopReadingTimer = () => {
        if (readingTimerRef.current) {
            clearInterval(readingTimerRef.current);
            readingTimerRef.current = null;
        }
    };

    const startReadingTimer = (limit: number | null) => {
        stopReadingTimer();
        setTimeLimit(limit);
        setElapsedSeconds(0);
        if (limit === null) {
            readingTimerRef.current = setInterval(() => {
                setElapsedSeconds((prev) => prev + 1);
            }, 1000);
            return;
        }
        setSecondsLeft(limit);
        readingTimerRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    stopReadingTimer();
                    handleStop();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const startStressPolling = (id: number) => {
        stopStressPolling();

        const poll = async () => {
            const response = await readingSpeedAttemptApi.getById(id);
            if (!response.success) {
                return;
            }
            setStressStatus(response.data.stressStatus);
            setStressProgress(response.data.stressProgress);
            setStressAccuracy(response.data.stressAccuracy);
            setGradeScores(pickGradeScores(response.data));
            if (STRESS_TERMINAL_STATUSES.includes(response.data.stressStatus)) {
                stopStressPolling();
            }
        };

        poll();
        stressPollRef.current = setInterval(poll, STRESS_POLL_INTERVAL_MS);
    };

    const cleanup = () => {
        stopAudioStream();
        socketRef.current?.close();
        socketRef.current = null;
        stopStressPolling();
        stopReadingTimer();
    };

    useEffect(() => {
        return cleanup;
    }, []);

    const onCancel = () => {
        cleanup();
        router.back();
    };

    useBackHandler(() => {
        onCancel();
        return true;
    });

    const loadAssignments = async () => {
        setAssignmentsLoading(true);
        const response = await classroomReadingApi.fetchMyReadings();
        if (response.success) {
            setAssignments(response.data);
        }
        setAssignmentsLoading(false);
    };

    useEffect(() => {
        if (phase === "idle" && studentId) {
            loadAssignments();
        }
    }, [phase, studentId]);

    const handleStart = async (assignment?: ClassroomReading) => {
        if (!studentId) {
            return;
        }

        setErrorMessage(null);
        setStatuses({});
        setTentativeStatuses({});
        setMetrics(null);
        setQuiz(null);
        setQuizScore(null);
        resultReceivedRef.current = false;
        quizReceivedRef.current = false;
        socketClosedRef.current = false;
        setAttemptId(null);
        setStressStatus(null);
        setStressProgress(null);
        setStressAccuracy(null);
        setGradeScores(null);
        setQuizSubmitted(false);
        stopStressPolling();
        stopReadingTimer();
        setPhase("connecting");

        const granted = await requestMicrophonePermission();
        if (!granted) {
            setErrorMessage(i18n.t("microphone_permission_denied"));
            setPhase("idle");
            return;
        }

        const socket = new ReadingSpeedSocket();
        socketRef.current = socket;

        try {
            const reference = await socket.connect(studentId, undefined, {
                onWordEvent: (event) => {
                    if (event.tentative) {
                        setTentativeStatuses((prev) => ({...prev, [event.index]: event.status}));
                    } else {
                        setStatuses((prev) => ({...prev, [event.index]: event.status}));
                    }
                },
                onProcessing: () => {
                    stopReadingTimer();
                    stopAudioStream();
                    setPhase("processing");
                },
                onQuiz: (questions) => {
                    quizReceivedRef.current = true;
                    if (questions.length > 0) {
                        setQuiz(questions);
                        setPhase("quiz");
                    }
                },
                onResult: (result) => {
                    resultReceivedRef.current = true;
                    stopReadingTimer();
                    stopAudioStream();
                    setMetrics(result.metrics);
                    if (!quizReceivedRef.current && result.quiz && result.quiz.length > 0) {
                        quizReceivedRef.current = true;
                        setQuiz(result.quiz);
                        setPhase("quiz");
                    } else if (phaseRef.current !== "quiz") {
                        setPhase("finished");
                    }
                    if (result.attempt_id !== null) {
                        setAttemptId(result.attempt_id);
                        setStressStatus("PENDING");
                        startStressPolling(result.attempt_id);
                    }
                },
                onError: (error) => {
                    console.error("[ReadingSpeed] socket error", error);
                },
                onClose: () => {
                    socketRef.current = null;
                    socketClosedRef.current = true;
                    if (phaseRef.current === "processing" && !resultReceivedRef.current) {
                        setErrorMessage(i18n.t("reading_speed_processing_failed"));
                        setPhase("idle");
                    }
                },
            }, assignment?.id);

            setReferenceWords(reference.words);
            setReferenceTitle(assignment?.name || reference.title);
            setPhase("reading");
            startReadingTimer(reference.time_limit_seconds !== undefined ? reference.time_limit_seconds : READING_TIME_LIMIT_SECONDS);

            startAudioStream((chunk) => {
                socketRef.current?.sendAudioChunk(chunk);
            });
        } catch (error) {
            console.error("[ReadingSpeed] failed to start session", error);
            const noAttempts = error instanceof ReadingSpeedConnectError && error.reason === "No attempts left";
            setErrorMessage(i18n.t(noAttempts ? "reading_no_attempts_left" : "reading_speed_connection_failed"));
            setPhase("idle");
        }
    };

    useEffect(() => {
        if (attemptId === null || quizScore === null || quizSubmitted) {
            return;
        }
        setQuizSubmitted(true);
        readingSpeedAttemptApi.submitQuizResult({id: attemptId, correct: quizScore}).then((response) => {
            if (response.success && response.data.grade != null) {
                setGradeScores(pickGradeScores(response.data));
            }
        });
    }, [attemptId, quizScore, quizSubmitted]);

    const quizPending = (quiz?.length ?? 0) > 0 && !quizSubmitted;
    const stressPending = stressStatus === null || !STRESS_TERMINAL_STATUSES.includes(stressStatus);
    const gradePending = grade == null && attemptId !== null && (quizPending || stressPending);

    const handleQuizFinish = (correctCount: number) => {
        setQuizScore(correctCount);
        if (resultReceivedRef.current) {
            setPhase("finished");
        } else if (socketClosedRef.current) {
            setErrorMessage(i18n.t("reading_speed_processing_failed"));
            setPhase("idle");
        } else {
            setPhase("processing");
        }
    };

    const handleStop = () => {
        stopReadingTimer();
        stopAudioStream();
        socketRef.current?.stop();
        setPhase("processing");
    };

    const handleRestart = () => {
        socketRef.current?.close();
        socketRef.current = null;
        stopStressPolling();
        stopReadingTimer();
        setPhase("idle");
    };

    const formatSeconds = (value: number) => `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
    const formattedTimeLeft = timeLimit === null ? formatSeconds(elapsedSeconds) : formatSeconds(secondsLeft);

    return (
        <>
            <CustomStackScreen/>
            <YStack flex={1}>
                <Header backgroundColor="transparent">
                    <XStack justifyContent="space-between" width="100%" paddingHorizontal={8}>
                        <HeaderButton
                            onPress={onCancel}
                            backgroundColor="transparent"
                            color="$gray-20"
                            text={i18n.t("back")}
                        />
                    </XStack>
                </Header>

                <YStack flex={1} paddingHorizontal={16} paddingVertical={16} gap={24}>
                    <CustomText size="h3Medium" color="$gray-20">
                        {i18n.t("reading_speed_title")}
                    </CustomText>

                    {!studentId && (
                        <CustomText size="p1Regular" color="$gray-40">
                            {i18n.t("reading_speed_students_only")}
                        </CustomText>
                    )}

                    {errorMessage && (
                        <CustomText size="p1Regular" color="$error-primary">
                            {errorMessage}
                        </CustomText>
                    )}

                    {phase === "idle" && studentId && (
                        <ScrollView style={{flex: 1}} contentContainerStyle={{gap: 16, paddingBottom: 24}}>
                            <CustomText size="p1Regular" color="$gray-40">
                                {i18n.t("reading_speed_description")}
                            </CustomText>

                            <YStack gap={8}>
                                <CustomText size="h5Medium" color="$gray-20">
                                    {i18n.t("reading_assignments")}
                                </CustomText>
                                {assignmentsLoading && assignments.length === 0 && (
                                    <ActivityIndicator size="small" color="#CB5A2E"/>
                                )}
                                {!assignmentsLoading && assignments.length === 0 && (
                                    <CustomText size="p2Regular" color="$gray-40">
                                        {i18n.t("reading_no_assignments")}
                                    </CustomText>
                                )}
                                {assignments.map((assignment) => (
                                    <StudentReadingCard
                                        key={assignment.id}
                                        reading={assignment}
                                        onStart={() => handleStart(assignment)}
                                    />
                                ))}
                            </YStack>

                            <YStack
                                backgroundColor="#FFFFFF"
                                borderRadius={20}
                                padding={16}
                                borderWidth={1}
                                borderColor="$gray-85"
                                gap={12}
                            >
                                <YStack gap={2}>
                                    <CustomText size="h5Medium" color="$gray-20">
                                        {i18n.t("reading_free_practice")}
                                    </CustomText>
                                    <CustomText size="p2Regular" color="$gray-40">
                                        {i18n.t("reading_free_practice_hint")}
                                    </CustomText>
                                </YStack>
                                <PrimaryButton
                                    text={i18n.t("reading_speed_start")}
                                    onPress={() => handleStart()}
                                />
                            </YStack>
                        </ScrollView>
                    )}

                    {phase === "connecting" && (
                        <YStack flex={1} justifyContent="center" alignItems="center">
                            <ActivityIndicator size="large" color="#CB5A2E"/>
                        </YStack>
                    )}

                    {phase === "reading" && (
                        <>
                            <XStack justifyContent="space-between" alignItems="center">
                                <CustomText size="h5Medium" color="$gray-40">
                                    {referenceTitle}
                                </CustomText>
                                <CustomText
                                    size="h4Medium"
                                    color={timeLimit !== null && secondsLeft <= 10 ? "$error-primary" : "$gray-20"}
                                >
                                    {formattedTimeLeft}
                                </CustomText>
                            </XStack>
                            <ScrollView style={{flex: 1}}>
                                <HighlightedWordText
                                    words={referenceWords}
                                    statuses={statuses}
                                    tentativeStatuses={tentativeStatuses}
                                />
                            </ScrollView>
                            <PrimaryButton
                                text={i18n.t("reading_speed_stop")}
                                onPress={handleStop}
                            />
                        </>
                    )}

                    {phase === "processing" && (
                        <YStack flex={1} justifyContent="center">
                            <YStack
                                backgroundColor="#FFFFFF"
                                borderRadius={28}
                                padding={24}
                                borderWidth={1}
                                borderColor="$gray-85"
                                gap={12}
                                alignItems="center"
                                style={{
                                    shadowColor: "rgba(43, 32, 19, 0.08)",
                                    shadowOffset: {width: 0, height: 4},
                                    shadowRadius: 10,
                                    shadowOpacity: 1,
                                }}
                            >
                                <ActivityIndicator size="large" color="#CB5A2E"/>
                                <CustomText size="h5Medium" color="$gray-20" textAlign="center">
                                    {i18n.t("reading_speed_processing")}
                                </CustomText>
                                <CustomText size="p2Regular" color="$gray-40" textAlign="center">
                                    {i18n.t("reading_speed_processing_hint")}
                                </CustomText>
                            </YStack>
                        </YStack>
                    )}

                    {phase === "quiz" && quiz && (
                        <ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1, justifyContent: "center"}}>
                            <ComprehensionQuiz questions={quiz} onFinish={handleQuizFinish}/>
                        </ScrollView>
                    )}

                    {phase === "finished" && metrics && (
                        <YStack flex={1} gap={16} justifyContent="center">
                            <YStack
                                backgroundColor="#FFFFFF"
                                borderRadius={28}
                                padding={24}
                                borderWidth={1}
                                borderColor="$gray-85"
                                gap={12}
                                style={{
                                    shadowColor: "rgba(43, 32, 19, 0.08)",
                                    shadowOffset: {width: 0, height: 4},
                                    shadowRadius: 10,
                                    shadowOpacity: 1,
                                }}
                            >
                                <YStack gap={2}>
                                    <XStack justifyContent="space-between" alignItems="center">
                                        <CustomText size="h5Medium" color="$gray-20">
                                            {i18n.t("reading_speed_grade")}
                                        </CustomText>
                                        {gradePending ? (
                                            <XStack alignItems="center" gap={8}>
                                                <ActivityIndicator size="small" color="#CB5A2E"/>
                                                <CustomText size="p1Regular" color="$gray-40">
                                                    {i18n.t("reading_speed_grade_pending")}
                                                </CustomText>
                                            </XStack>
                                        ) : (
                                            <CustomText size="h2" color="#CB5A2E">
                                                {grade != null ? formatGrade(grade) : "—"}
                                            </CustomText>
                                        )}
                                    </XStack>
                                    <CustomText size="p1Regular" color="$gray-40">
                                        {i18n.t("reading_grade_sum_hint")}
                                    </CustomText>
                                </YStack>

                                <ScoreSection
                                    title={i18n.t("reading_grade_speed")}
                                    score={gradeScores?.speedScore}
                                    pending={gradePending}
                                >
                                    <MetricLine
                                        label={i18n.t("reading_speed_wpm")}
                                        value={gradeScores?.targetWpm != null
                                            ? i18n.t("reading_result_wpm_of_norm", {wpm: metrics.wpm, norm: gradeScores.targetWpm})
                                            : metrics.wpm}
                                    />
                                </ScoreSection>

                                <ScoreSection
                                    title={i18n.t("reading_grade_pronunciation")}
                                    score={gradeScores?.pronunciationScore}
                                    pending={gradePending}
                                >
                                    <MetricLine
                                        label={i18n.t("reading_speed_correct")}
                                        value={`${metrics.correct_count}/${metrics.total_words} (${Math.round(metrics.accuracy * 100)}%)`}
                                    />
                                    <MetricLine
                                        label={i18n.t("reading_result_errors_skipped")}
                                        value={`${metrics.error_count} / ${metrics.skipped_count}`}
                                    />
                                    {stressStatus && stressStatus !== "NOT_APPLICABLE" && (
                                        <MetricLine
                                            label={i18n.t("reading_speed_stress_accuracy")}
                                            value={stressStatus === "DONE" ? (
                                                stressAccuracy !== null ? `${Math.round(stressAccuracy * 100)}%` : "—"
                                            ) : stressStatus === "FAILED" ? (
                                                i18n.t("reading_speed_stress_failed")
                                            ) : (
                                                <XStack alignItems="center" gap={8}>
                                                    <ActivityIndicator size="small" color="#CB5A2E"/>
                                                    <CustomText size="p1Regular" color="$gray-40">
                                                        {stressProgress !== null
                                                            ? `${stressProgress}%`
                                                            : i18n.t("reading_speed_stress_processing")}
                                                    </CustomText>
                                                </XStack>
                                            )}
                                        />
                                    )}
                                    {(stressStatus === "PENDING" || stressStatus === "PROCESSING") && (
                                        <>
                                            <YStack height={6} borderRadius={3} backgroundColor="$gray-85" overflow="hidden">
                                                <YStack
                                                    height="100%"
                                                    width={`${stressProgress ?? 6}%`}
                                                    backgroundColor="#CB5A2E"
                                                    borderRadius={3}
                                                />
                                            </YStack>
                                            <CustomText size="p1Regular" color="$gray-40">
                                                {i18n.t("reading_speed_stress_hint")}
                                            </CustomText>
                                        </>
                                    )}
                                </ScoreSection>

                                <ScoreSection
                                    title={i18n.t("reading_grade_comprehension")}
                                    score={gradeScores?.comprehensionScore}
                                    pending={gradePending && (quiz?.length ?? 0) > 0}
                                >
                                    <MetricLine
                                        label={i18n.t("reading_result_quiz_answers")}
                                        value={quizScore !== null && quiz && quiz.length > 0
                                            ? `${quizScore}/${quiz.length}`
                                            : i18n.t("reading_grade_no_quiz")}
                                    />
                                </ScoreSection>
                            </YStack>

                            <PrimaryButton
                                text={i18n.t("reading_speed_try_again")}
                                onPress={handleRestart}
                            />
                        </YStack>
                    )}
                </YStack>
            </YStack>
        </>
    );
};

export default ReadingSpeed;
