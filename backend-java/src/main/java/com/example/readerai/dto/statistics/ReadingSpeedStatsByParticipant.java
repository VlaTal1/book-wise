package com.example.readerai.dto.statistics;

import com.example.readerai.dto.ParticipantDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingSpeedStatsByParticipant {

    private ParticipantDTO participant;

    private int attemptsCount;

    private float averageWpm;

    private float averageAccuracy;

    private Float averageStressAccuracy;

    private int stressCheckedAttemptsCount;

    private Float averageGrade;

    private int gradedAttemptsCount;

    private Integer lastGrade;

    private Float gradeTrend;
}
