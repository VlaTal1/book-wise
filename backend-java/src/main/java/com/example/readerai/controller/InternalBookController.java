package com.example.readerai.controller;

import com.example.readerai.dto.BookDTO;
import com.example.readerai.exception.PermissionDeniedException;
import com.example.readerai.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class InternalBookController {

    private final BookService bookService;

    @Value("${internal.api-key}")
    private String internalApiKey;

    @GetMapping("/internal/participants/{participantId}/books")
    public ResponseEntity<List<BookDTO>> getBooksForParticipant(
            @RequestHeader("X-Internal-Api-Key") String apiKey,
            @PathVariable Long participantId
    ) {
        if (!internalApiKey.equals(apiKey)) {
            throw new PermissionDeniedException("Invalid internal API key");
        }
        return ResponseEntity.ok(bookService.getAllBooksByParticipantId(participantId));
    }
}
