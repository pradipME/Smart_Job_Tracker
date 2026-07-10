package com.jobtrack.dto.ai;

import java.util.List;

public class RankCandidatesResponse {

    private List<RankedCandidate> rankedCandidates;

    public List<RankedCandidate> getRankedCandidates() { return rankedCandidates; }
    public void setRankedCandidates(List<RankedCandidate> rankedCandidates) { this.rankedCandidates = rankedCandidates; }

    public static class RankedCandidate {
        private Long id;
        private String name;
        private int score;
        private String reasoning;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }
        public String getReasoning() { return reasoning; }
        public void setReasoning(String reasoning) { this.reasoning = reasoning; }
    }
}
