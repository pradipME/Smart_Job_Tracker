package com.jobtrack.dto;

import jakarta.validation.constraints.NotNull;
import com.jobtrack.entity.ApplicationStatus;

public class StatusUpdateRequest {

    @NotNull
    private ApplicationStatus status;

    private String comment;

    private Long assessmentId;

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }
}
