package com.jobtrack.dto.ai;

import java.util.List;

public class CoverLetterReviewResponse {

    private List<String> grammarIssues;
    private String professionalismScore;
    private List<String> suggestions;

    public List<String> getGrammarIssues() { return grammarIssues; }
    public void setGrammarIssues(List<String> grammarIssues) { this.grammarIssues = grammarIssues; }
    public String getProfessionalismScore() { return professionalismScore; }
    public void setProfessionalismScore(String professionalismScore) { this.professionalismScore = professionalismScore; }
    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }
}
