package com.example.readerai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "READING_SPEED_ATTEMPT")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingSpeedAttempt extends Audit {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "READING_SPEED_ATTEMPT_SEQ_ID")
    @SequenceGenerator(name = "READING_SPEED_ATTEMPT_SEQ_ID", sequenceName = "READING_SPEED_ATTEMPT_SEQ_ID", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PARTICIPANT_ID", nullable = false, referencedColumnName = "ID", foreignKey = @ForeignKey(name = "FK_READING_SPEED_ATTEMPT_PARTICIPANT"))
    private Participant participant;

    @Column(name = "TEXT_ID", nullable = false)
    private String textId;

    @Column(name = "TOTAL_WORDS", nullable = false)
    private Integer totalWords;

    @Column(name = "CORRECT_COUNT", nullable = false)
    private Integer correctCount;

    @Column(name = "ERROR_COUNT", nullable = false)
    private Integer errorCount;

    @Column(name = "SKIPPED_COUNT", nullable = false)
    private Integer skippedCount;

    @Column(name = "NOT_IN_VOCABULARY_COUNT", nullable = false)
    private Integer notInVocabularyCount;

    @Column(name = "DURATION_SECONDS", nullable = false)
    private Double durationSeconds;

    @Column(name = "WPM", nullable = false)
    private Double wpm;

    @Column(name = "ACCURACY", nullable = false)
    private Double accuracy;

    @Column(name = "WORDS_JSON", nullable = false, columnDefinition = "TEXT")
    private String wordsJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "STRESS_STATUS", nullable = false, length = 20)
    @Builder.Default
    private StressStatus stressStatus = StressStatus.PENDING;

    @Column(name = "STRESS_PROGRESS")
    private Integer stressProgress;

    @Column(name = "STRESS_ACCURACY")
    private Double stressAccuracy;

    @Column(name = "STRESS_CHECKED_WORDS")
    private Integer stressCheckedWords;

    @Column(name = "STRESS_CORRECT_WORDS")
    private Integer stressCorrectWords;

    @Column(name = "STRESS_WORDS_JSON", columnDefinition = "TEXT")
    private String stressWordsJson;

    @Column(name = "STRESS_ERROR", columnDefinition = "TEXT")
    private String stressError;

    @Column(name = "AUDIO_FILE_NAME")
    private String audioFileName;

    @Column(name = "REFERENCE_WORDS_JSON", columnDefinition = "TEXT")
    private String referenceWordsJson;

    @Column(name = "TARGET_WPM")
    private Integer targetWpm;

    @Column(name = "QUIZ_TOTAL")
    private Integer quizTotal;

    @Column(name = "QUIZ_CORRECT")
    private Integer quizCorrect;

    @Column(name = "GRADE")
    private Integer grade;

    @Column(name = "SPEED_SCORE")
    private Integer speedScore;

    @Column(name = "PRONUNCIATION_SCORE")
    private Integer pronunciationScore;

    @Column(name = "COMPREHENSION_SCORE")
    private Integer comprehensionScore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CLASSROOM_READING_ID", referencedColumnName = "ID", foreignKey = @ForeignKey(name = "FK_READING_SPEED_ATTEMPT_CLASSROOM_READING"))
    private ClassroomReading classroomReading;
}
