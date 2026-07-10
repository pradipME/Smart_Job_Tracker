package com.jobtrack.dto;

import com.jobtrack.entity.Question;

public class QuestionResponse {

    private Long id;
    private String questionText;
    private String questionType;
    private String options;
    private String correctAnswer;
    private Integer marks;
    private Integer orderIndex;

    public QuestionResponse() {}

    public static QuestionResponse fromEntity(Question q) {
        QuestionResponse res = new QuestionResponse();
        res.setId(q.getId());
        res.setQuestionText(q.getQuestionText());
        res.setQuestionType(q.getQuestionType().name());
        res.setOptions(q.getOptions());
        res.setCorrectAnswer(q.getCorrectAnswer());
        res.setMarks(q.getMarks());
        res.setOrderIndex(q.getOrderIndex());
        return res;
    }

    public static QuestionResponse forCandidate(Question q) {
        QuestionResponse res = new QuestionResponse();
        res.setId(q.getId());
        res.setQuestionText(q.getQuestionText());
        res.setQuestionType(q.getQuestionType().name());
        res.setOptions(q.getOptions());
        res.setMarks(q.getMarks());
        res.setOrderIndex(q.getOrderIndex());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
    public String getOptions() { return options; }
    public void setOptions(String options) { this.options = options; }
    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    public Integer getMarks() { return marks; }
    public void setMarks(Integer marks) { this.marks = marks; }
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}
