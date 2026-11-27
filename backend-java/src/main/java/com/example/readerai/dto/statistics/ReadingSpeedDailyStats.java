package com.example.readerai.dto.statistics;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingSpeedDailyStats {

    private LocalDate date;

    private int attemptsCount;

    private float averageWpm;

    private float averageAccuracy;

    private Float averageStressAccuracy;

    private Float averageGrade;
}
