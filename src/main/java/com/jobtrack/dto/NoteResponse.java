package com.jobtrack.dto;

import com.jobtrack.entity.RecruiterNote;
import java.time.LocalDateTime;

public class NoteResponse {

    private Long id;
    private Long applicationId;
    private String content;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public NoteResponse() {}

    public static NoteResponse fromEntity(RecruiterNote note) {
        NoteResponse res = new NoteResponse();
        res.setId(note.getId());
        res.setApplicationId(note.getApplicationId());
        res.setContent(note.getContent());
        res.setCreatedBy(note.getCreatedBy());
        res.setCreatedAt(note.getCreatedAt());
        res.setUpdatedAt(note.getUpdatedAt());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
