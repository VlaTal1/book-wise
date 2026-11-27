package com.example.readerai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "CLASSROOM_READING")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomReading extends Audit {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "CLASSROOM_READING_SEQ_ID")
    @SequenceGenerator(name = "CLASSROOM_READING_SEQ_ID", sequenceName = "CLASSROOM_READING_SEQ_ID", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CLASSROOM_ID", nullable = false, referencedColumnName = "ID", foreignKey = @ForeignKey(name = "FK_CLASSROOM_READING_CLASSROOM"))
    private Classroom classroom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BOOK_ID", nullable = false, referencedColumnName = "ID", foreignKey = @ForeignKey(name = "FK_CLASSROOM_READING_BOOK"))
    private Book book;

    @Column(name = "NAME", length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "MODE", nullable = false, length = 20)
    @Builder.Default
    private ReadingMode mode = ReadingMode.FIXED;

    @Column(name = "START_PAGE")
    private Integer startPage;

    @Column(name = "END_PAGE")
    private Integer endPage;

    @Column(name = "TEXT", columnDefinition = "TEXT")
    private String text;

    @Column(name = "WORD_COUNT")
    private Integer wordCount;

    @Column(name = "TIME_LIMIT_SECONDS")
    private Integer timeLimitSeconds;

    @Column(name = "MAX_ATTEMPTS")
    private Integer maxAttempts;
}
