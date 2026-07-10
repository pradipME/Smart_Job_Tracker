package com.jobtrack.dto;

import com.jobtrack.entity.Application;
import java.time.LocalDateTime;

public class ApplicationResponse {

    private Long id;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String companyLogoUrl;
    private String resumeUrl;
    private String coverLetter;
    private String status;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;

    public ApplicationResponse() {}

    public static ApplicationResponse fromEntity(Application app) {
        ApplicationResponse res = new ApplicationResponse();
        res.setId(app.getId());
        res.setCandidateId(app.getCandidate().getId());
        res.setCandidateName(app.getCandidate().getFullName());
        res.setCandidateEmail(app.getCandidate().getEmail());
        res.setJobId(app.getJob().getId());
        res.setJobTitle(app.getJob().getTitle());
        res.setCompanyName(app.getJob().getCompany().getName());
        res.setCompanyLogoUrl(app.getJob().getCompany().getLogoUrl());
        res.setResumeUrl(app.getResumeUrl());
        res.setCoverLetter(app.getCoverLetter());
        res.setStatus(app.getStatus().name());
        res.setAppliedAt(app.getAppliedAt());
        res.setUpdatedAt(app.getUpdatedAt());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }
    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getCompanyLogoUrl() { return companyLogoUrl; }
    public void setCompanyLogoUrl(String companyLogoUrl) { this.companyLogoUrl = companyLogoUrl; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
