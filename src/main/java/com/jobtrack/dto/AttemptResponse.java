package com.jobtrack.dto;

import com.jobtrack.entity.ApplicationAssessment;
import com.jobtrack.entity.AttemptStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class AttemptResponse {

    private Long id;
    private Long applicationId;
    private Long assessmentId;
    private String assessmentTitle;
    private String assessmentDescription;
    private Integer duration;
    private Integer totalMarks;
    private Integer passingMarks;
    private LocalDate deadline;
    private String instructions;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer score;
    private Double percentage;
    private Boolean passed;
    private List<QuestionResponse> questions;

    public AttemptResponse() {}

    public static AttemptResponse fromEntity(ApplicationAssessment aa, List<QuestionResponse> questions) {
        AttemptResponse res = new AttemptResponse();
        res.setId(aa.getId());
        res.setApplicationId(aa.getApplicationId());
        res.setAssessmentId(aa.getAssessment().getId());
        res.setAssessmentTitle(aa.getAssessment().getTitle());
        res.setAssessmentDescription(aa.getAssessment().getDescription());
        res.setDuration(aa.getAssessment().getDuration());
        res.setTotalMarks(aa.getAssessment().getTotalMarks());
        res.setPassingMarks(aa.getAssessment().getPassingMarks());
        res.setDeadline(aa.getAssessment().getDeadline());
        res.setInstructions(aa.getAssessment().getInstructions());
        res.setStatus(aa.getStatus().name());
        res.setStartedAt(aa.getStartedAt());
        res.setSubmittedAt(aa.getSubmittedAt());
        res.setScore(aa.getScore());
        res.setPercentage(aa.getPercentage());
        res.setPassed(aa.getPassed());
        res.setQuestions(questions);
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }
    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }
    public String getAssessmentTitle() { return assessmentTitle; }
    public void setAssessmentTitle(String assessmentTitle) { this.assessmentTitle = assessmentTitle; }
    public String getAssessmentDescription() { return assessmentDescription; }
    public void setAssessmentDescription(String assessmentDescription) { this.assessmentDescription = assessmentDescription; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public Integer getPassingMarks() { return passingMarks; }
    public void setPassingMarks(Integer passingMarks) { this.passingMarks = passingMarks; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    public Boolean getPassed() { return passed; }
    public void setPassed(Boolean passed) { this.passed = passed; }
    public List<QuestionResponse> getQuestions() { return questions; }
    public void setQuestions(List<QuestionResponse> questions) { this.questions = questions; }
}
