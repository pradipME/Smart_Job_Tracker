package com.jobtrack.dto;

import com.jobtrack.entity.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class JobListingResponse {

    private Long id;
    private Long companyId;
    private String companyName;
    private String companyLogoUrl;
    private String title;
    private String description;
    private String location;
    private String experience;
    private Integer salaryMin;
    private Integer salaryMax;
    private String employmentType;
    private String workMode;
    private String requiredSkills;
    private Integer openings;
    private LocalDate deadline;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public JobListingResponse() {
    }

    public static JobListingResponse fromEntity(JobListing job) {
        JobListingResponse res = new JobListingResponse();
        res.setId(job.getId());
        res.setCompanyId(job.getCompany().getId());
        res.setCompanyName(job.getCompany().getName());
        res.setCompanyLogoUrl(job.getCompany().getLogoUrl());
        res.setTitle(job.getTitle());
        res.setDescription(job.getDescription());
        res.setLocation(job.getLocation());
        res.setExperience(job.getExperience());
        res.setSalaryMin(job.getSalaryMin());
        res.setSalaryMax(job.getSalaryMax());
        res.setEmploymentType(job.getEmploymentType() != null ? job.getEmploymentType().name() : null);
        res.setWorkMode(job.getWorkMode() != null ? job.getWorkMode().name() : null);
        res.setRequiredSkills(job.getRequiredSkills());
        res.setOpenings(job.getOpenings());
        res.setDeadline(job.getDeadline());
        res.setStatus(job.getStatus().name());
        res.setCreatedAt(job.getCreatedAt());
        res.setUpdatedAt(job.getUpdatedAt());
        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyLogoUrl() {
        return companyLogoUrl;
    }

    public void setCompanyLogoUrl(String companyLogoUrl) {
        this.companyLogoUrl = companyLogoUrl;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public Integer getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(Integer salaryMin) {
        this.salaryMin = salaryMin;
    }

    public Integer getSalaryMax() {
        return salaryMax;
    }

    public void setSalaryMax(Integer salaryMax) {
        this.salaryMax = salaryMax;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public String getWorkMode() {
        return workMode;
    }

    public void setWorkMode(String workMode) {
        this.workMode = workMode;
    }

    public String getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public Integer getOpenings() {
        return openings;
    }

    public void setOpenings(Integer openings) {
        this.openings = openings;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
