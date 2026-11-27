package com.example.readerai.dto.reading;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentReadingResultDTO {

    private Long participantId;

    private String participantName;

    private Integer attemptsCount;

    private Integer bestGrade;

    private Long bestAttemptId;

    private Double bestWpm;

    private Integer bestSpeedScore;

    private Integer bestPronunciationScore;

    private Integer bestComprehensionScore;

    private Double bestAccuracy;

    private Integer bestQuizTotal;

    private Integer bestQuizCorrect;

    private Boolean gradePending;
}
