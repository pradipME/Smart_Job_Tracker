package com.jobtrack.dto;

import com.jobtrack.entity.EmploymentType;
import com.jobtrack.entity.JobListingStatus;
import com.jobtrack.entity.WorkMode;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class JobListingRequest {

    @NotNull(message = "Company ID is required")
    private Long companyId;

    @NotBlank(message = "Title is required")
    @Size(max = 255)
    private String title;

    private String description;

    @Size(max = 255)
    private String location;

    @Size(max = 100)
    private String experience;

    @Min(0)
    private Integer salaryMin;

    @Min(0)
    private Integer salaryMax;

    private EmploymentType employmentType;

    private WorkMode workMode;

    private String requiredSkills;

    @Min(1)
    private Integer openings;

    private LocalDate deadline;

    private JobListingStatus status = JobListingStatus.DRAFT;

    public JobListingRequest() {
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
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

    public EmploymentType getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(EmploymentType employmentType) {
        this.employmentType = employmentType;
    }

    public WorkMode getWorkMode() {
        return workMode;
    }

    public void setWorkMode(WorkMode workMode) {
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

    public JobListingStatus getStatus() {
        return status;
    }

    public void setStatus(JobListingStatus status) {
        this.status = status;
    }
}
