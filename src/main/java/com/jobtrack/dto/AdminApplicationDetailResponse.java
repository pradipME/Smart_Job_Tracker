package com.jobtrack.dto;

import com.jobtrack.entity.Application;
import java.time.LocalDateTime;
import java.util.List;

public class AdminApplicationDetailResponse {

    private Long id;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private Long jobId;
    private String jobTitle;
    private String jobDescription;
    private String jobLocation;
    private Integer jobSalaryMin;
    private Integer jobSalaryMax;
    private String jobEmploymentType;
    private String jobWorkMode;
    private String jobExperience;
    private String jobRequiredSkills;
    private Long companyId;
    private String companyName;
    private String companyLogoUrl;
    private String companyLocation;
    private String companyIndustry;
    private String resumeUrl;
    private String coverLetter;
    private String status;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    private List<ApplicationHistoryResponse> history;
    private List<NoteResponse> notes;

    public AdminApplicationDetailResponse() {}

    public static AdminApplicationDetailResponse fromEntity(Application app, List<ApplicationHistoryResponse> history, List<NoteResponse> notes) {
        AdminApplicationDetailResponse res = new AdminApplicationDetailResponse();
        res.setId(app.getId());
        res.setCandidateId(app.getCandidate().getId());
        res.setCandidateName(app.getCandidate().getFullName());
        res.setCandidateEmail(app.getCandidate().getEmail());
        res.setJobId(app.getJob().getId());
        res.setJobTitle(app.getJob().getTitle());
        res.setJobDescription(app.getJob().getDescription());
        res.setJobLocation(app.getJob().getLocation());
        res.setJobSalaryMin(app.getJob().getSalaryMin());
        res.setJobSalaryMax(app.getJob().getSalaryMax());
        res.setJobEmploymentType(app.getJob().getEmploymentType() != null ? app.getJob().getEmploymentType().name() : null);
        res.setJobWorkMode(app.getJob().getWorkMode() != null ? app.getJob().getWorkMode().name() : null);
        res.setJobExperience(app.getJob().getExperience());
        res.setJobRequiredSkills(app.getJob().getRequiredSkills());
        res.setCompanyId(app.getJob().getCompany().getId());
        res.setCompanyName(app.getJob().getCompany().getName());
        res.setCompanyLogoUrl(app.getJob().getCompany().getLogoUrl());
        res.setCompanyLocation(app.getJob().getCompany().getLocation());
        res.setCompanyIndustry(app.getJob().getCompany().getIndustry());
        res.setResumeUrl(app.getResumeUrl());
        res.setCoverLetter(app.getCoverLetter());
        res.setStatus(app.getStatus().name());
        res.setAppliedAt(app.getAppliedAt());
        res.setUpdatedAt(app.getUpdatedAt());
        res.setHistory(history);
        res.setNotes(notes);
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
    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
    public String getJobLocation() { return jobLocation; }
    public void setJobLocation(String jobLocation) { this.jobLocation = jobLocation; }
    public Integer getJobSalaryMin() { return jobSalaryMin; }
    public void setJobSalaryMin(Integer jobSalaryMin) { this.jobSalaryMin = jobSalaryMin; }
    public Integer getJobSalaryMax() { return jobSalaryMax; }
    public void setJobSalaryMax(Integer jobSalaryMax) { this.jobSalaryMax = jobSalaryMax; }
    public String getJobEmploymentType() { return jobEmploymentType; }
    public void setJobEmploymentType(String jobEmploymentType) { this.jobEmploymentType = jobEmploymentType; }
    public String getJobWorkMode() { return jobWorkMode; }
    public void setJobWorkMode(String jobWorkMode) { this.jobWorkMode = jobWorkMode; }
    public String getJobExperience() { return jobExperience; }
    public void setJobExperience(String jobExperience) { this.jobExperience = jobExperience; }
    public String getJobRequiredSkills() { return jobRequiredSkills; }
    public void setJobRequiredSkills(String jobRequiredSkills) { this.jobRequiredSkills = jobRequiredSkills; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getCompanyLogoUrl() { return companyLogoUrl; }
    public void setCompanyLogoUrl(String companyLogoUrl) { this.companyLogoUrl = companyLogoUrl; }
    public String getCompanyLocation() { return companyLocation; }
    public void setCompanyLocation(String companyLocation) { this.companyLocation = companyLocation; }
    public String getCompanyIndustry() { return companyIndustry; }
    public void setCompanyIndustry(String companyIndustry) { this.companyIndustry = companyIndustry; }
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
    public List<ApplicationHistoryResponse> getHistory() { return history; }
    public void setHistory(List<ApplicationHistoryResponse> history) { this.history = history; }
    public List<NoteResponse> getNotes() { return notes; }
    public void setNotes(List<NoteResponse> notes) { this.notes = notes; }
}
