package com.jobtrack.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "assessment_answers")
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long applicationAssessmentId;

    @Column(nullable = false)
    private Long questionId;

    @Column(length = 2000)
    private String answerText;

    private Integer marksObtained;

    private Boolean isCorrect;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getApplicationAssessmentId() { return applicationAssessmentId; }
    public void setApplicationAssessmentId(Long applicationAssessmentId) { this.applicationAssessmentId = applicationAssessmentId; }
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public String getAnswerText() { return answerText; }
    public void setAnswerText(String answerText) { this.answerText = answerText; }
    public Integer getMarksObtained() { return marksObtained; }
    public void setMarksObtained(Integer marksObtained) { this.marksObtained = marksObtained; }
    public Boolean getIsCorrect() { return isCorrect; }
    public void setIsCorrect(Boolean isCorrect) { this.isCorrect = isCorrect; }
}
