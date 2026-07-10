package com.jobtrack.dto;

import com.jobtrack.entity.Assessment;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class AssessmentResponse {

    private Long id;
    private String title;
    private String description;
    private Integer duration;
    private Integer passingMarks;
    private Integer totalMarks;
    private LocalDate deadline;
    private String instructions;
    private String status;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int questionCount;
    private List<QuestionResponse> questions;

    public AssessmentResponse() {}

    public static AssessmentResponse fromEntity(Assessment a, List<QuestionResponse> questions) {
        AssessmentResponse res = new AssessmentResponse();
        res.setId(a.getId());
        res.setTitle(a.getTitle());
        res.setDescription(a.getDescription());
        res.setDuration(a.getDuration());
        res.setPassingMarks(a.getPassingMarks());
        res.setTotalMarks(a.getTotalMarks());
        res.setDeadline(a.getDeadline());
        res.setInstructions(a.getInstructions());
        res.setStatus(a.getStatus().name());
        if (a.getJob() != null) {
            res.setJobId(a.getJob().getId());
            res.setJobTitle(a.getJob().getTitle());
            res.setCompanyName(a.getJob().getCompany().getName());
        }
        res.setCreatedAt(a.getCreatedAt());
        res.setUpdatedAt(a.getUpdatedAt());
        res.setQuestionCount(questions != null ? questions.size() : 0);
        res.setQuestions(questions);
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public Integer getPassingMarks() { return passingMarks; }
    public void setPassingMarks(Integer passingMarks) { this.passingMarks = passingMarks; }
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public int getQuestionCount() { return questionCount; }
    public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }
    public List<QuestionResponse> getQuestions() { return questions; }
    public void setQuestions(List<QuestionResponse> questions) { this.questions = questions; }
}
