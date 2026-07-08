package com.jobtrack.dto;

public class DashboardResponse {

    private long totalJobs;
    private long applied;
    private long interview;
    private long offer;
    private long rejected;

    public DashboardResponse() {
    }

    public DashboardResponse(long totalJobs,
                             long applied,
                             long interview,
                             long offer,
                             long rejected) {
        this.totalJobs = totalJobs;
        this.applied = applied;
        this.interview = interview;
        this.offer = offer;
        this.rejected = rejected;
    }

    public long getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(long totalJobs) {
        this.totalJobs = totalJobs;
    }

    public long getApplied() {
        return applied;
    }

    public void setApplied(long applied) {
        this.applied = applied;
    }

    public long getInterview() {
        return interview;
    }

    public void setInterview(long interview) {
        this.interview = interview;
    }

    public long getOffer() {
        return offer;
    }

    public void setOffer(long offer) {
        this.offer = offer;
    }

    public long getRejected() {
        return rejected;
    }

    public void setRejected(long rejected) {
        this.rejected = rejected;
    }
}