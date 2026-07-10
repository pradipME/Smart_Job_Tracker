package com.jobtrack.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SubmitResponse {

    private Long attemptId;
    private Integer score;
    private Integer totalMarks;
    private double percentage;
    private boolean passed;
    private int correctCount;
    private int totalQuestions;
    private LocalDateTime submittedAt;
    private List<AnswerResult> answerResults;

    public SubmitResponse() {}

    public Long getAttemptId() { return attemptId; }
    public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }
    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }
    public int getCorrectCount() { return correctCount; }
    public void setCorrectCount(int correctCount) { this.correctCount = correctCount; }
    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public List<AnswerResult> getAnswerResults() { return answerResults; }
    public void setAnswerResults(List<AnswerResult> answerResults) { this.answerResults = answerResults; }

    public static class AnswerResult {
        private Long questionId;
        private String questionText;
        private String yourAnswer;
        private String correctAnswer;
        private boolean isCorrect;
        private int marksObtained;
        private int marks;

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public String getYourAnswer() { return yourAnswer; }
        public void setYourAnswer(String yourAnswer) { this.yourAnswer = yourAnswer; }
        public String getCorrectAnswer() { return correctAnswer; }
        public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
        public boolean isCorrect() { return isCorrect; }
        public void setCorrect(boolean correct) { isCorrect = correct; }
        public int getMarksObtained() { return marksObtained; }
        public void setMarksObtained(int marksObtained) { this.marksObtained = marksObtained; }
        public int getMarks() { return marks; }
        public void setMarks(int marks) { this.marks = marks; }
    }
}
