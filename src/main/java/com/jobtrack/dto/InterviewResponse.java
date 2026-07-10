package com.jobtrack.dto;

import com.jobtrack.entity.Interview;
import com.jobtrack.entity.InterviewMode;
import com.jobtrack.entity.InterviewRound;
import com.jobtrack.entity.InterviewStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class InterviewResponse {

    private Long id;
    private Long applicationId;
    private String candidateName;
    private String candidateEmail;
    private String jobTitle;
    private String companyName;
    private String interviewerName;
    private String interviewerEmail;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String mode;
    private String meetingLink;
    private String location;
    private String round;
    private String status;
    private String feedback;
    private Integer rating;
    private LocalDateTime createdAt;

    public static InterviewResponse fromEntity(Interview i) {
        InterviewResponse r = new InterviewResponse();
        r.setId(i.getId());
        r.setApplicationId(i.getApplication().getId());
        r.setCandidateName(i.getApplication().getCandidate().getFullName());
        r.setCandidateEmail(i.getApplication().getCandidate().getEmail());
        r.setJobTitle(i.getApplication().getJob().getTitle());
        r.setCompanyName(i.getApplication().getJob().getCompany().getName());
        r.setInterviewerName(i.getInterviewerName());
        r.setInterviewerEmail(i.getInterviewerEmail());
        r.setDate(i.getDate());
        r.setStartTime(i.getStartTime());
        r.setEndTime(i.getEndTime());
        r.setMode(i.getMode().name());
        r.setMeetingLink(i.getMeetingLink());
        r.setLocation(i.getLocation());
        r.setRound(i.getRound().name());
        r.setStatus(i.getStatus().name());
        r.setFeedback(i.getFeedback());
        r.setRating(i.getRating());
        r.setCreatedAt(i.getCreatedAt());
        return r;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }
    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
