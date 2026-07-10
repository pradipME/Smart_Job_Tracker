package com.jobtrack.dto;

import com.jobtrack.entity.Application;
import java.time.LocalDateTime;

public class AdminApplicationSummaryResponse {

    private Long id;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private Long companyId;
    private String companyName;
    private String companyLogoUrl;
    private Long jobId;
    private String jobTitle;
    private String status;
    private LocalDateTime appliedAt;
    private String resumeUrl;

    public AdminApplicationSummaryResponse() {}

    public static AdminApplicationSummaryResponse fromEntity(Application app) {
        AdminApplicationSummaryResponse res = new AdminApplicationSummaryResponse();
        res.setId(app.getId());
        res.setCandidateId(app.getCandidate().getId());
        res.setCandidateName(app.getCandidate().getFullName());
        res.setCandidateEmail(app.getCandidate().getEmail());
        res.setCompanyId(app.getJob().getCompany().getId());
        res.setCompanyName(app.getJob().getCompany().getName());
        res.setCompanyLogoUrl(app.getJob().getCompany().getLogoUrl());
        res.setJobId(app.getJob().getId());
        res.setJobTitle(app.getJob().getTitle());
        res.setStatus(app.getStatus().name());
        res.setAppliedAt(app.getAppliedAt());
        res.setResumeUrl(app.getResumeUrl());
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
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getCompanyLogoUrl() { return companyLogoUrl; }
    public void setCompanyLogoUrl(String companyLogoUrl) { this.companyLogoUrl = companyLogoUrl; }
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
}
