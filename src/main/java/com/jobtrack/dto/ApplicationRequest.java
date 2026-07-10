package com.jobtrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ApplicationRequest {

    @NotNull(message = "Job ID is required")
    private Long jobId;

    @NotBlank(message = "Resume is required")
    private String resumeUrl;

    @Size(max = 3000, message = "Cover letter must not exceed 3000 characters")
    private String coverLetter;

    public ApplicationRequest() {}

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
}
