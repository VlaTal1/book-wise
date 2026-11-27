package com.example.readerai.dto.reading;

import com.example.readerai.dto.AuditDTO;
import com.example.readerai.entity.ReadingMode;
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
public class ClassroomReadingDTO extends AuditDTO {

    private Long id;

    private Long classroomId;

    private String name;

    private ReadingMode mode;

    private Long bookId;

    private String bookTitle;

    private Integer startPage;

    private Integer endPage;

    private Integer wordCount;

    private String preview;

    private Integer timeLimitSeconds;

    private Integer maxAttempts;

    private Integer studentsCount;

    private Integer completedCount;

    private Integer attemptsUsed;

    private Integer bestGrade;
}
