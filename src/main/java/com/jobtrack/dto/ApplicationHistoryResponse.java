package com.jobtrack.dto;

import com.jobtrack.entity.ApplicationHistory;
import java.time.LocalDateTime;

public class ApplicationHistoryResponse {

    private Long id;
    private String fromStatus;
    private String toStatus;
    private String changedBy;
    private LocalDateTime changedAt;
    private String comment;

    public ApplicationHistoryResponse() {}

    public static ApplicationHistoryResponse fromEntity(ApplicationHistory h) {
        ApplicationHistoryResponse res = new ApplicationHistoryResponse();
        res.setId(h.getId());
        res.setFromStatus(h.getFromStatus() != null ? h.getFromStatus().name() : null);
        res.setToStatus(h.getToStatus().name());
        res.setChangedBy(h.getChangedBy());
        res.setChangedAt(h.getChangedAt());
        res.setComment(h.getComment());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFromStatus() { return fromStatus; }
    public void setFromStatus(String fromStatus) { this.fromStatus = fromStatus; }
    public String getToStatus() { return toStatus; }
    public void setToStatus(String toStatus) { this.toStatus = toStatus; }
    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }
    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
