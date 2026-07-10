package com.jobtrack.dto.ai;

import java.util.List;
import java.util.Map;

public class GenerateQuestionsResponse {

    private Map<String, List<String>> questions;

    public Map<String, List<String>> getQuestions() { return questions; }
    public void setQuestions(Map<String, List<String>> questions) { this.questions = questions; }
}
