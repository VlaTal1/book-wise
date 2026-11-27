package com.example.readerai.dto.reading;

import com.example.readerai.entity.ReadingMode;
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
public class ReadingSessionDTO {

    private Long id;

    private ReadingMode mode;

    private String title;

    private String text;

    private Long bookId;

    private String fileName;

    private String fileType;

    private String catalogKey;

    private Integer timeLimitSeconds;

    private Integer maxAttempts;

    private Integer attemptsUsed;
}
