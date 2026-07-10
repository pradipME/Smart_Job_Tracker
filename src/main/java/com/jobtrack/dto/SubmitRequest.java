package com.jobtrack.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class SubmitRequest {

    @NotNull
    private List<AnswerEntry> answers;

    public List<AnswerEntry> getAnswers() { return answers; }
    public void setAnswers(List<AnswerEntry> answers) { this.answers = answers; }

    public static class AnswerEntry {
        @NotNull
        private Long questionId;

        private String answerText;

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public String getAnswerText() { return answerText; }
        public void setAnswerText(String answerText) { this.answerText = answerText; }
    }
}
