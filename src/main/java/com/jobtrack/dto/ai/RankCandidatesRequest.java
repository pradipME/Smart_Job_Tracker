package com.jobtrack.dto.ai;

import java.util.List;

public class RankCandidatesRequest {

    private String jobDescription;
    private List<CandidateData> candidates;

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
    public List<CandidateData> getCandidates() { return candidates; }
    public void setCandidates(List<CandidateData> candidates) { this.candidates = candidates; }

    public static class CandidateData {
        private Long id;
        private String name;
        private String resumeText;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getResumeText() { return resumeText; }
        public void setResumeText(String resumeText) { this.resumeText = resumeText; }
    }
}
