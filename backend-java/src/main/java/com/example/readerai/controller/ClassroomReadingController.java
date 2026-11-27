package com.example.readerai.controller;

import com.example.readerai.dto.reading.ClassroomReadingDTO;
import com.example.readerai.dto.reading.ClassroomReadingRequest;
import com.example.readerai.dto.reading.ClassroomReadingResultsDTO;
import com.example.readerai.dto.reading.ReadingSessionDTO;
import com.example.readerai.exception.PermissionDeniedException;
import com.example.readerai.service.ClassroomReadingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ClassroomReadingController {

    private final ClassroomReadingService classroomReadingService;

    @Value("${internal.api-key}")
    private String internalApiKey;

    @GetMapping("/api/classrooms/{id}/reading-preview")
    public ResponseEntity<List<String>> preview(
            @PathVariable Long id,
            @RequestParam Long bookId,
            @RequestParam Integer startPage,
            @RequestParam Integer endPage
    ) {
        return ResponseEntity.ok(classroomReadingService.preview(id, bookId, startPage, endPage));
    }

    @PostMapping("/api/classrooms/{id}/readings")
    public ResponseEntity<ClassroomReadingDTO> create(@PathVariable Long id, @RequestBody ClassroomReadingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(classroomReadingService.create(id, request));
    }

    @GetMapping("/api/classrooms/{id}/readings/{readingId}/results")
    public ResponseEntity<ClassroomReadingResultsDTO> getResults(@PathVariable Long id, @PathVariable Long readingId) {
        return ResponseEntity.ok(classroomReadingService.getResults(id, readingId));
    }

    @DeleteMapping("/api/classrooms/{id}/readings/{readingId}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @PathVariable Long readingId) {
        classroomReadingService.delete(id, readingId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/classroom-readings/my")
    public ResponseEntity<List<ClassroomReadingDTO>> getMine() {
        return ResponseEntity.ok(classroomReadingService.getForCurrentStudent());
    }

    @GetMapping("/internal/classroom-readings/{readingId}/session")
    public ResponseEntity<ReadingSessionDTO> getSession(
            @RequestHeader("X-Internal-Api-Key") String apiKey,
            @PathVariable Long readingId,
            @RequestParam Long participantId
    ) {
        if (!internalApiKey.equals(apiKey)) {
            throw new PermissionDeniedException("Invalid internal API key");
        }
        return ResponseEntity.ok(classroomReadingService.getSession(readingId, participantId));
    }
}
