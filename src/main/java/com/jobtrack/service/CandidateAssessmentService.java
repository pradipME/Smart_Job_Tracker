package com.jobtrack.service;

import com.jobtrack.dto.*;
import com.jobtrack.entity.*;
import com.jobtrack.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CandidateAssessmentService {

    private final ApplicationAssessmentRepository appAssessmentRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final AssessmentRepository assessmentRepository;
    private final UserRepository userRepository;

    public CandidateAssessmentService(ApplicationAssessmentRepository appAssessmentRepository,
                                      QuestionRepository questionRepository,
                                      AnswerRepository answerRepository,
                                      AssessmentRepository assessmentRepository,
                                      UserRepository userRepository) {
        this.appAssessmentRepository = appAssessmentRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.assessmentRepository = assessmentRepository;
        this.userRepository = userRepository;
    }

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<AttemptResponse> getMyAssessments() {
        User candidate = getLoggedInUser();
        return appAssessmentRepository.findByCandidateId(candidate.getId())
                .stream()
                .map(aa -> {
                    List<QuestionResponse> questions = null;
                    if (aa.getStatus() == AttemptStatus.IN_PROGRESS) {
                        questions = questionRepository.findByAssessmentIdOrderByOrderIndexAsc(aa.getAssessment().getId())
                                .stream()
                                .map(QuestionResponse::forCandidate)
                                .toList();
                    }
                    return AttemptResponse.fromEntity(aa, questions);
                })
                .toList();
    }

    @Transactional
    public AttemptResponse startAssessment(Long appAssessmentId) {
        User candidate = getLoggedInUser();
        ApplicationAssessment aa = appAssessmentRepository.findByIdAndDeletedFalse(appAssessmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));

        if (!aa.getCandidateId().equals(candidate.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This assessment does not belong to you");
        }

        if (aa.getStatus() != AttemptStatus.ASSIGNED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assessment already started or completed");
        }

        if (aa.getAssessment().getDeadline() != null && aa.getAssessment().getDeadline().isBefore(java.time.LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assessment deadline has passed");
        }

        aa.setStatus(AttemptStatus.IN_PROGRESS);
        aa.setStartedAt(LocalDateTime.now());
        appAssessmentRepository.save(aa);

        List<QuestionResponse> questions = questionRepository.findByAssessmentIdOrderByOrderIndexAsc(aa.getAssessment().getId())
                .stream()
                .map(QuestionResponse::forCandidate)
                .toList();

        return AttemptResponse.fromEntity(aa, questions);
    }

    @Transactional
    public SubmitResponse submitAssessment(Long appAssessmentId, SubmitRequest request) {
        User candidate = getLoggedInUser();
        ApplicationAssessment aa = appAssessmentRepository.findByIdAndDeletedFalse(appAssessmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));

        if (!aa.getCandidateId().equals(candidate.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This assessment does not belong to you");
        }

        if (aa.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assessment is not in progress");
        }

        List<Question> questions = questionRepository.findByAssessmentIdOrderByOrderIndexAsc(aa.getAssessment().getId());
        Map<Long, Question> questionMap = questions.stream().collect(Collectors.toMap(Question::getId, q -> q));

        List<SubmitResponse.AnswerResult> answerResults = new ArrayList<>();
        int totalScore = 0;
        int correctCount = 0;
        int totalMarks = questions.stream().mapToInt(Question::getMarks).sum();

        Map<Long, String> submittedAnswers = request.getAnswers() != null
                ? request.getAnswers().stream().collect(Collectors.toMap(SubmitRequest.AnswerEntry::getQuestionId, a -> a.getAnswerText() != null ? a.getAnswerText() : ""))
                : Map.of();

        for (Question q : questions) {
            Answer answer = new Answer();
            answer.setApplicationAssessmentId(appAssessmentId);
            answer.setQuestionId(q.getId());

            String userAnswer = submittedAnswers.getOrDefault(q.getId(), "");
            answer.setAnswerText(userAnswer);

            boolean isCorrect = false;
            int marksObtained = 0;

            if (q.getQuestionType() == QuestionType.MCQ || q.getQuestionType() == QuestionType.TRUE_FALSE) {
                isCorrect = q.getCorrectAnswer() != null && q.getCorrectAnswer().trim().equalsIgnoreCase(userAnswer.trim());
                marksObtained = isCorrect ? q.getMarks() : 0;
            } else if (q.getQuestionType() == QuestionType.SHORT_ANSWER) {
                if (q.getCorrectAnswer() != null && !q.getCorrectAnswer().isEmpty()) {
                    isCorrect = q.getCorrectAnswer().trim().equalsIgnoreCase(userAnswer.trim());
                    marksObtained = isCorrect ? q.getMarks() : 0;
                }
            }

            answer.setIsCorrect(isCorrect);
            answer.setMarksObtained(marksObtained);
            answerRepository.save(answer);

            if (isCorrect) correctCount++;
            totalScore += marksObtained;

            SubmitResponse.AnswerResult result = new SubmitResponse.AnswerResult();
            result.setQuestionId(q.getId());
            result.setQuestionText(q.getQuestionText());
            result.setYourAnswer(userAnswer);
            result.setCorrectAnswer(q.getCorrectAnswer() != null ? q.getCorrectAnswer() : "");
            result.setCorrect(isCorrect);
            result.setMarksObtained(marksObtained);
            result.setMarks(q.getMarks());
            answerResults.add(result);
        }

        aa.setStatus(AttemptStatus.COMPLETED);
        aa.setSubmittedAt(LocalDateTime.now());
        aa.setScore(totalScore);
        double percentage = totalMarks > 0 ? (double) totalScore / totalMarks * 100 : 0;
        aa.setPercentage(percentage);
        aa.setPassed(percentage >= aa.getAssessment().getPassingMarks());
        appAssessmentRepository.save(aa);

        SubmitResponse response = new SubmitResponse();
        response.setAttemptId(appAssessmentId);
        response.setScore(totalScore);
        response.setTotalMarks(totalMarks);
        response.setPercentage(percentage);
        response.setPassed(percentage >= aa.getAssessment().getPassingMarks());
        response.setCorrectCount(correctCount);
        response.setTotalQuestions(questions.size());
        response.setSubmittedAt(LocalDateTime.now());
        response.setAnswerResults(answerResults);

        return response;
    }

    public SubmitResponse getMyResult(Long appAssessmentId) {
        User candidate = getLoggedInUser();
        ApplicationAssessment aa = appAssessmentRepository.findByIdAndDeletedFalse(appAssessmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));

        if (!aa.getCandidateId().equals(candidate.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This assessment does not belong to you");
        }

        List<Answer> answers = answerRepository.findByApplicationAssessmentId(appAssessmentId);
        List<Question> questions = questionRepository.findByAssessmentIdOrderByOrderIndexAsc(aa.getAssessment().getId());
        Map<Long, Question> questionMap = questions.stream().collect(Collectors.toMap(Question::getId, q -> q));

        List<SubmitResponse.AnswerResult> answerResults = new ArrayList<>();
        int totalScore = 0;
        int correctCount = 0;
        int totalMarks = questions.stream().mapToInt(Question::getMarks).sum();

        for (Answer answer : answers) {
            Question q = questionMap.get(answer.getQuestionId());
            if (q == null) continue;

            totalScore += answer.getMarksObtained();
            if (answer.getIsCorrect()) correctCount++;

            SubmitResponse.AnswerResult result = new SubmitResponse.AnswerResult();
            result.setQuestionId(q.getId());
            result.setQuestionText(q.getQuestionText());
            result.setYourAnswer(answer.getAnswerText());
            result.setCorrectAnswer(q.getCorrectAnswer() != null ? q.getCorrectAnswer() : "");
            result.setCorrect(answer.getIsCorrect());
            result.setMarksObtained(answer.getMarksObtained());
            result.setMarks(q.getMarks());
            answerResults.add(result);
        }

        double percentage = totalMarks > 0 ? (double) totalScore / totalMarks * 100 : 0;

        SubmitResponse response = new SubmitResponse();
        response.setAttemptId(appAssessmentId);
        response.setScore(aa.getScore() != null ? aa.getScore() : totalScore);
        response.setTotalMarks(totalMarks);
        response.setPercentage(aa.getPercentage() != null ? aa.getPercentage() : percentage);
        response.setPassed(aa.getPassed() != null ? aa.getPassed() : percentage >= aa.getAssessment().getPassingMarks());
        response.setCorrectCount(correctCount);
        response.setTotalQuestions(questions.size());
        response.setSubmittedAt(aa.getSubmittedAt());
        response.setAnswerResults(answerResults);

        return response;
    }
}
