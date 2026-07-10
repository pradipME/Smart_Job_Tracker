package com.jobtrack.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class AssessmentRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private Integer duration;

    @NotNull
    private Integer passingMarks;

    @NotNull
    private Integer totalMarks;

    private LocalDate deadline;

    private String instructions;

    private String status;

    private Long jobId;

    @Valid
    private List<QuestionRequest> questions;

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
    public List<QuestionRequest> getQuestions() { return questions; }
    public void setQuestions(List<QuestionRequest> questions) { this.questions = questions; }
}
