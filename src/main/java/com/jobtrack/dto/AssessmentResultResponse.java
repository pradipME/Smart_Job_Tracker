package com.jobtrack.dto;

import com.jobtrack.entity.ApplicationAssessment;
import java.time.LocalDateTime;

public class AssessmentResultResponse {

    private Long id;
    private Long applicationId;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private Integer score;
    private Integer totalMarks;
    private double percentage;
    private boolean passed;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private String attemptDuration;

    public AssessmentResultResponse() {}

    public static AssessmentResultResponse fromEntity(ApplicationAssessment aa) {
        AssessmentResultResponse res = new AssessmentResultResponse();
        res.setId(aa.getId());
        res.setApplicationId(aa.getApplicationId());
        res.setCandidateId(aa.getCandidateId());
        res.setScore(aa.getScore() != null ? aa.getScore() : 0);
        res.setTotalMarks(aa.getAssessment().getTotalMarks());
        res.setPercentage(aa.getPercentage() != null ? aa.getPercentage() : 0.0);
        res.setPassed(aa.getPassed() != null && aa.getPassed());
        res.setStatus(aa.getStatus().name());
        res.setStartedAt(aa.getStartedAt());
        res.setSubmittedAt(aa.getSubmittedAt());

        if (aa.getStartedAt() != null && aa.getSubmittedAt() != null) {
            long mins = java.time.Duration.between(aa.getStartedAt(), aa.getSubmittedAt()).toMinutes();
            long secs = java.time.Duration.between(aa.getStartedAt(), aa.getSubmittedAt()).toSeconds() % 60;
            res.setAttemptDuration(mins + "m " + secs + "s");
        }

        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }
    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }
    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }
    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public String getAttemptDuration() { return attemptDuration; }
    public void setAttemptDuration(String attemptDuration) { this.attemptDuration = attemptDuration; }
}
