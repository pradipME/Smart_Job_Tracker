package com.jobtrack.dto;

import java.util.List;
import java.util.Map;

public class AdminDashboardStatsResponse {

    private long applicationsToday;
    private long pendingReview;
    private long interviewScheduled;
    private long selected;
    private long rejected;
    private List<StatusCount> byStatus;
    private List<CompanyCount> byCompany;
    private List<MonthlyCount> monthly;

    public AdminDashboardStatsResponse() {}

    public long getApplicationsToday() { return applicationsToday; }
    public void setApplicationsToday(long applicationsToday) { this.applicationsToday = applicationsToday; }
    public long getPendingReview() { return pendingReview; }
    public void setPendingReview(long pendingReview) { this.pendingReview = pendingReview; }
    public long getInterviewScheduled() { return interviewScheduled; }
    public void setInterviewScheduled(long interviewScheduled) { this.interviewScheduled = interviewScheduled; }
    public long getSelected() { return selected; }
    public void setSelected(long selected) { this.selected = selected; }
    public long getRejected() { return rejected; }
    public void setRejected(long rejected) { this.rejected = rejected; }
    public List<StatusCount> getByStatus() { return byStatus; }
    public void setByStatus(List<StatusCount> byStatus) { this.byStatus = byStatus; }
    public List<CompanyCount> getByCompany() { return byCompany; }
    public void setByCompany(List<CompanyCount> byCompany) { this.byCompany = byCompany; }
    public List<MonthlyCount> getMonthly() { return monthly; }
    public void setMonthly(List<MonthlyCount> monthly) { this.monthly = monthly; }

    public static class StatusCount {
        private String status;
        private long count;

        public StatusCount() {}
        public StatusCount(String status, long count) { this.status = status; this.count = count; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class CompanyCount {
        private String companyName;
        private long count;

        public CompanyCount() {}
        public CompanyCount(String companyName, long count) { this.companyName = companyName; this.count = count; }

        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class MonthlyCount {
        private int year;
        private int month;
        private long count;

        public MonthlyCount() {}
        public MonthlyCount(int year, int month, long count) { this.year = year; this.month = month; this.count = count; }

        public int getYear() { return year; }
        public void setYear(int year) { this.year = year; }
        public int getMonth() { return month; }
        public void setMonth(int month) { this.month = month; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }
}
