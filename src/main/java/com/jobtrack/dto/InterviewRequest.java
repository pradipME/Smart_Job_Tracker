package com.jobtrack.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

public class InterviewRequest {

    @NotNull
    private Long applicationId;

    @NotBlank
    private String interviewerName;

    @NotBlank
    @Email
    private String interviewerEmail;

    @NotNull
    private LocalDate date;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    @NotBlank
    private String mode;

    private String meetingLink;

    private String location;

    @NotBlank
    private String round;

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }
    public String getInterviewerName() { return interviewerName; }
    public void setInterviewerName(String interviewerName) { this.interviewerName = interviewerName; }
    public String getInterviewerEmail() { return interviewerEmail; }
    public void setInterviewerEmail(String interviewerEmail) { this.interviewerEmail = interviewerEmail; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getRound() { return round; }
    public void setRound(String round) { this.round = round; }
}
