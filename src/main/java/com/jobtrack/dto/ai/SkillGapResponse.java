package com.jobtrack.dto.ai;

import java.util.List;

public class SkillGapResponse {

    private List<String> missingSkills;
    private List<String> recommendations;

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
}
