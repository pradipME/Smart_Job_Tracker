package com.jobtrack.service;

import com.jobtrack.dto.*;
import com.jobtrack.entity.*;
import com.jobtrack.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminAssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final QuestionRepository questionRepository;
    private final ApplicationAssessmentRepository appAssessmentRepository;
    private final AnswerRepository answerRepository;
    private final JobListingRepository jobListingRepository;

    public AdminAssessmentService(AssessmentRepository assessmentRepository,
                                  QuestionRepository questionRepository,
                                  ApplicationAssessmentRepository appAssessmentRepository,
                                  AnswerRepository answerRepository,
                                  JobListingRepository jobListingRepository) {
        this.assessmentRepository = assessmentRepository;
        this.questionRepository = questionRepository;
        this.appAssessmentRepository = appAssessmentRepository;
        this.answerRepository = answerRepository;
        this.jobListingRepository = jobListingRepository;
    }

    public Page<AssessmentResponse> getAssessments(String search, String status, int page, int size) {
        AssessmentStatus statusEnum = null;
        if (status != null && !status.isEmpty()) {
            try { statusEnum = AssessmentStatus.valueOf(status.toUpperCase()); } catch (IllegalArgumentException ignored) {}
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        String searchParam = (search != null && !search.isEmpty()) ? search : null;

        return assessmentRepository.searchAssessments(searchParam, statusEnum, pageable)
                .map(a -> AssessmentResponse.fromEntity(a, null));
    }

    public AssessmentResponse getAssessment(Long id) {
        Assessment a = assessmentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));

        List<QuestionResponse> questions = questionRepository.findByAssessmentIdOrderByOrderIndexAsc(id)
                .stream()
                .map(QuestionResponse::fromEntity)
                .toList();

        return AssessmentResponse.fromEntity(a, questions);
    }

    @Transactional
    public AssessmentResponse createAssessment(AssessmentRequest request) {
        Assessment a = new Assessment();
        a.setTitle(request.getTitle());
        a.setDescription(request.getDescription());
        a.setDuration(request.getDuration());
        a.setPassingMarks(request.getPassingMarks());
        a.setTotalMarks(request.getTotalMarks());
        a.setDeadline(request.getDeadline());
        a.setInstructions(request.getInstructions());

        if (request.getStatus() != null) {
            try { a.setStatus(AssessmentStatus.valueOf(request.getStatus().toUpperCase())); } catch (IllegalArgumentException ignored) {}
        }

        if (request.getJobId() != null) {
            JobListing job = jobListingRepository.findByIdAndDeletedFalse(request.getJobId())
                    .orElse(null);
            a.setJob(job);
        }

        Assessment saved = assessmentRepository.save(a);

        if (request.getQuestions() != null) {
            for (QuestionRequest qReq : request.getQuestions()) {
                Question q = new Question();
                q.setAssessment(saved);
                q.setQuestionText(qReq.getQuestionText());
                try { q.setQuestionType(QuestionType.valueOf(qReq.getQuestionType().toUpperCase())); } catch (IllegalArgumentException ignored) { q.setQuestionType(QuestionType.SHORT_ANSWER); }
                q.setOptions(qReq.getOptions());
                q.setCorrectAnswer(qReq.getCorrectAnswer());
                q.setMarks(qReq.getMarks());
                q.setOrderIndex(qReq.getOrderIndex());
                questionRepository.save(q);
            }
        }

        return getAssessment(saved.getId());
    }

    @Transactional
    public AssessmentResponse updateAssessment(Long id, AssessmentRequest request) {
        Assessment a = assessmentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));

        a.setTitle(request.getTitle());
        a.setDescription(request.getDescription());
        a.setDuration(request.getDuration());
        a.setPassingMarks(request.getPassingMarks());
        a.setTotalMarks(request.getTotalMarks());
        a.setDeadline(request.getDeadline());
        a.setInstructions(request.getInstructions());

        if (request.getStatus() != null) {
            try { a.setStatus(AssessmentStatus.valueOf(request.getStatus().toUpperCase())); } catch (IllegalArgumentException ignored) {}
        }

        if (request.getJobId() != null) {
            JobListing job = jobListingRepository.findByIdAndDeletedFalse(request.getJobId())
                    .orElse(null);
            a.setJob(job);
        } else {
            a.setJob(null);
        }

        a.getQuestions().clear();

        if (request.getQuestions() != null) {
            for (QuestionRequest qReq : request.getQuestions()) {
                Question q = new Question();
                q.setAssessment(a);
                q.setQuestionText(qReq.getQuestionText());
                try { q.setQuestionType(QuestionType.valueOf(qReq.getQuestionType().toUpperCase())); } catch (IllegalArgumentException ignored) { q.setQuestionType(QuestionType.SHORT_ANSWER); }
                q.setOptions(qReq.getOptions());
                q.setCorrectAnswer(qReq.getCorrectAnswer());
                q.setMarks(qReq.getMarks());
                q.setOrderIndex(qReq.getOrderIndex());
                a.getQuestions().add(q);
            }
        }

        assessmentRepository.save(a);
        return getAssessment(id);
    }

    @Transactional
    public void deleteAssessment(Long id) {
        Assessment a = assessmentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));
        a.setDeleted(true);
        assessmentRepository.save(a);
    }

    @Transactional
    public AssessmentResponse updateStatus(Long id, String newStatus) {
        Assessment a = assessmentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));

        try {
            a.setStatus(AssessmentStatus.valueOf(newStatus.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + newStatus);
        }

        assessmentRepository.save(a);
        return getAssessment(id);
    }

    public List<SubmitResponse.AnswerResult> getResults(Long assessmentId) {
        Assessment a = assessmentRepository.findByIdAndDeletedFalse(assessmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));

        List<ApplicationAssessment> attempts = appAssessmentRepository.findByAssessmentId(assessmentId)
                .stream()
                .filter(aa -> aa.getStatus() == AttemptStatus.COMPLETED || aa.getStatus() == AttemptStatus.TIMEOUT)
                .toList();

        return attempts.stream()
                .map(aa -> {
                    SubmitResponse.AnswerResult r = new SubmitResponse.AnswerResult();
                    r.setCorrect(aa.getPassed() != null && aa.getPassed());
                    r.setMarksObtained(aa.getScore() != null ? aa.getScore() : 0);
                    r.setMarks(aa.getAssessment().getTotalMarks());
                    return r;
                })
                .collect(Collectors.toList());
    }

    public List<AssessmentResultResponse> getAssessmentResults(Long assessmentId) {
        Assessment a = assessmentRepository.findByIdAndDeletedFalse(assessmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));

        return appAssessmentRepository.findByAssessmentId(assessmentId)
                .stream()
                .filter(aa -> aa.getStatus() == AttemptStatus.COMPLETED || aa.getStatus() == AttemptStatus.TIMEOUT)
                .map(AssessmentResultResponse::fromEntity)
                .sorted(Comparator.comparingInt(AssessmentResultResponse::getScore).reversed())
                .collect(Collectors.toList());
    }
}
