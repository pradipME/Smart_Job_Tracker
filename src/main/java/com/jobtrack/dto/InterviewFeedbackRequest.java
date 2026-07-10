package com.jobtrack.dto;

import jakarta.validation.constraints.*;

public class InterviewFeedbackRequest {

    @NotBlank
    @Size(max = 3000)
    private String feedback;

    @Min(1)
    @Max(5)
    private Integer rating;

    @NotBlank
    private String status;

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
