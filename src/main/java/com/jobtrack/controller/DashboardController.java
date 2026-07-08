package com.jobtrack.controller;

import com.jobtrack.dto.DashboardResponse;
import com.jobtrack.service.JobService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final JobService jobService;

    public DashboardController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public DashboardResponse getDashboard() {
        return jobService.getDashboard();
    }
}