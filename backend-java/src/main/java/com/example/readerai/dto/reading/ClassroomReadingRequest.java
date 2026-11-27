package com.example.readerai.dto.reading;

import com.example.readerai.entity.ReadingMode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomReadingRequest {

    private ReadingMode mode;

    private String name;

    private Long bookId;

    private Integer startPage;

    private Integer endPage;

    private Integer startParagraph;

    private Integer endParagraph;

    private Integer timeLimitSeconds;

    private Integer maxAttempts;
}
