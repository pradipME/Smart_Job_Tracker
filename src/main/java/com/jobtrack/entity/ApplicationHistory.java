package com.jobtrack.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "application_history")
public class ApplicationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long applicationId;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus toStatus;

    @Column(nullable = false)
    private String changedBy;

    @Column(nullable = false)
    private LocalDateTime changedAt;

    @Column(length = 1000)
    private String comment;

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }
    public ApplicationStatus getFromStatus() { return fromStatus; }
    public void setFromStatus(ApplicationStatus fromStatus) { this.fromStatus = fromStatus; }
    public ApplicationStatus getToStatus() { return toStatus; }
    public void setToStatus(ApplicationStatus toStatus) { this.toStatus = toStatus; }
    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }
    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
