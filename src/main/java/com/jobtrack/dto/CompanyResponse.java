package com.jobtrack.dto;

import com.jobtrack.entity.Company;
import java.time.LocalDateTime;

public class CompanyResponse {

    private Long id;
    private String name;
    private String logoUrl;
    private String website;
    private String industry;
    private String location;
    private String companySize;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CompanyResponse() {
    }

    public static CompanyResponse fromEntity(Company company) {
        CompanyResponse res = new CompanyResponse();
        res.setId(company.getId());
        res.setName(company.getName());
        res.setLogoUrl(company.getLogoUrl());
        res.setWebsite(company.getWebsite());
        res.setIndustry(company.getIndustry());
        res.setLocation(company.getLocation());
        res.setCompanySize(company.getCompanySize());
        res.setDescription(company.getDescription());
        res.setCreatedAt(company.getCreatedAt());
        res.setUpdatedAt(company.getUpdatedAt());
        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCompanySize() {
        return companySize;
    }

    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
