package com.example.readerai.service;

import com.example.readerai.converter.ReadingSpeedAttemptConverter;
import com.example.readerai.dto.ReadingSpeedAttemptDTO;
import com.example.readerai.dto.StressProgressUpdateDTO;
import com.example.readerai.dto.StressResultUpdateDTO;
import com.example.readerai.entity.Participant;
import com.example.readerai.entity.ReadingSpeedAttempt;
import com.example.readerai.exception.NotFoundException;
import com.example.readerai.exception.PermissionDeniedException;
import com.example.readerai.repository.ParticipantRepository;
import com.example.readerai.repository.ReadingSpeedAttemptRepository;
import io.minio.errors.MinioException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReadingSpeedAttemptService {

    private final ReadingSpeedAttemptRepository readingSpeedAttemptRepository;

    private final ParticipantRepository participantRepository;

    private final ParticipantService participantService;

    private final UserService userService;

    private final ReadingSpeedAttemptConverter readingSpeedAttemptConverter;

    private final MinioService minioService;

    private final ClassroomReadingService classroomReadingService;

    public ReadingSpeedAttemptDTO save(ReadingSpeedAttemptDTO dto) {
        if (dto.getParticipantId() == null) {
            throw new IllegalArgumentException("Participant id cannot be null");
        }

        Participant participant = participantRepository.findById(dto.getParticipantId()).orElseThrow(
                () -> new NotFoundException("Participant not found")
        );

        ReadingSpeedAttempt attempt = readingSpeedAttemptConverter.fromDTO(dto);
        attempt.setParticipant(participant);
        if (participant.getClassroom() != null) {
            attempt.setTargetWpm(participant.getClassroom().getTargetWpm());
        }
        classroomReadingService.findById(dto.getClassroomReadingId()).ifPresent(attempt::setClassroomReading);

        ReadingSpeedAttempt savedAttempt = readingSpeedAttemptRepository.save(attempt);
        return readingSpeedAttemptConverter.toDTO(savedAttempt);
    }

    public List<ReadingSpeedAttemptDTO> getHistory(Long participantId) {
        participantService.findVisible(participantId);

        return readingSpeedAttemptRepository.findAllByParticipant_IdOrderByCreatedAtDesc(participantId).stream()
                .map(readingSpeedAttemptConverter::toDTO)
                .toList();
    }

    public List<ReadingSpeedAttemptDTO> getHistoryForCurrentUser() {
        return readingSpeedAttemptRepository.findAllByParticipant_IdInOrderByCreatedAtDesc(participantService.getVisibleStudentIds()).stream()
                .map(readingSpeedAttemptConverter::toDTO)
                .toList();
    }

    public ReadingSpeedAttemptDTO getById(Long id) {
        return readingSpeedAttemptConverter.toDTO(findOwnedAttempt(id));
    }

    public InputStream getAudioStream(Long id) throws MinioException {
        ReadingSpeedAttempt attempt = findOwnedAttempt(id);
        if (attempt.getAudioFileName() == null) {
            throw new NotFoundException("Audio not available for this attempt");
        }
        return minioService.getFile(attempt.getAudioFileName());
    }

    public void deleteAttempt(Long id) {
        ReadingSpeedAttempt attempt = findOwnedAttempt(id);
        if (attempt.getAudioFileName() != null) {
            try {
                minioService.deleteFile(attempt.getAudioFileName());
            } catch (MinioException e) {
                log.warn("Failed to delete audio {} from MinIO for attempt {}: {}", attempt.getAudioFileName(), id, e.getMessage());
            }
        }
        readingSpeedAttemptRepository.delete(attempt);
    }

    private ReadingSpeedAttempt findOwnedAttempt(Long id) {
        ReadingSpeedAttempt attempt = readingSpeedAttemptRepository.findById(id).orElseThrow(
                () -> new NotFoundException("Reading speed attempt not found")
        );
        participantService.assertCanView(attempt.getParticipant());
        return attempt;
    }

    public void updateStressProgress(Long id, StressProgressUpdateDTO dto) {
        ReadingSpeedAttempt attempt = readingSpeedAttemptRepository.findById(id).orElseThrow(
                () -> new NotFoundException("Reading speed attempt not found")
        );
        attempt.setStressStatus(dto.getStatus());
        attempt.setStressProgress(dto.getProgress());
        readingSpeedAttemptRepository.save(attempt);
    }

    public void updateStressResult(Long id, StressResultUpdateDTO dto) {
        ReadingSpeedAttempt attempt = readingSpeedAttemptRepository.findById(id).orElseThrow(
                () -> new NotFoundException("Reading speed attempt not found")
        );
        attempt.setStressStatus(dto.getStatus());
        attempt.setStressProgress(100);
        attempt.setStressAccuracy(dto.getAccuracy());
        attempt.setStressCheckedWords(dto.getCheckedWords());
        attempt.setStressCorrectWords(dto.getCorrectWords());
        attempt.setStressWordsJson(dto.getWordsJson());
        attempt.setStressError(dto.getError());
        updateGradeIfReady(attempt);
        readingSpeedAttemptRepository.save(attempt);
    }

    public ReadingSpeedAttemptDTO submitQuizResult(Long id, Integer correct) {
        ReadingSpeedAttempt attempt = readingSpeedAttemptRepository.findById(id).orElseThrow(
                () -> new NotFoundException("Reading speed attempt not found")
        );
        if (!Objects.equals(attempt.getParticipant().getUserId(), userService.getUserId())) {
            throw new PermissionDeniedException("Only the student can submit the quiz result");
        }
        if (attempt.getQuizTotal() == null || attempt.getQuizTotal() == 0) {
            throw new IllegalArgumentException("This attempt has no quiz");
        }
        if (correct == null || correct < 0 || correct > attempt.getQuizTotal()) {
            throw new IllegalArgumentException("Correct answers must be between 0 and " + attempt.getQuizTotal());
        }
        if (attempt.getQuizCorrect() != null) {
            return readingSpeedAttemptConverter.toDTO(attempt);
        }

        attempt.setQuizCorrect(correct);
        updateGradeIfReady(attempt);
        return readingSpeedAttemptConverter.toDTO(readingSpeedAttemptRepository.save(attempt));
    }

    private void updateGradeIfReady(ReadingSpeedAttempt attempt) {
        if (attempt.getGrade() == null && ReadingGradeCalculator.isReady(attempt)) {
            ReadingGradeCalculator.apply(attempt);
        }
    }
}
