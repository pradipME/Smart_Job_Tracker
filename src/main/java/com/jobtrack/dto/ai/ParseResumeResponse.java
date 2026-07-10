package com.jobtrack.dto.ai;

import java.util.List;

public class ParseResumeResponse {

    private String name;
    private List<String> skills;
    private List<String> education;
    private List<String> experience;
    private List<String> projects;
    private List<String> certificates;
    private List<String> technologies;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public List<String> getEducation() { return education; }
    public void setEducation(List<String> education) { this.education = education; }
    public List<String> getExperience() { return experience; }
    public void setExperience(List<String> experience) { this.experience = experience; }
    public List<String> getProjects() { return projects; }
    public void setProjects(List<String> projects) { this.projects = projects; }
    public List<String> getCertificates() { return certificates; }
    public void setCertificates(List<String> certificates) { this.certificates = certificates; }
    public List<String> getTechnologies() { return technologies; }
    public void setTechnologies(List<String> technologies) { this.technologies = technologies; }
}
