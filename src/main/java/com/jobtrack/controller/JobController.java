package com.jobtrack.controller;

import com.jobtrack.dto.JobRequest;
import com.jobtrack.entity.JobApplication;
import com.jobtrack.entity.JobStatus;
import com.jobtrack.service.JobService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    // Add Job
    @PostMapping
    public String addJob(@RequestBody JobRequest request) {
        return jobService.addJob(request);
    }

    // Get All Jobs
    @GetMapping
    public List<JobApplication> getAllJobs() {
        return jobService.getAllJobs();
    }

    // Pagination
    @GetMapping("/page")
    public Page<JobApplication> getJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        return jobService.getJobs(page, size);
    }

    // Search
    @GetMapping("/search")
    public List<JobApplication> searchJobs(@RequestParam String company) {
        return jobService.searchJobs(company);
    }

    // Filter
    @GetMapping("/filter")
    public List<JobApplication> filterJobs(@RequestParam JobStatus status) {
        return jobService.filterJobs(status);
    }

    // Get Job By Id
    @GetMapping("/{id}")
    public JobApplication getJobById(@PathVariable Long id) {
        return jobService.getJobById(id);
    }

    // Update Job
    @PutMapping("/{id}")
    public String updateJob(@PathVariable Long id,
                            @RequestBody JobRequest request) {
        return jobService.updateJob(id, request);
    }

    // Delete Job
    @DeleteMapping("/{id}")
    public String deleteJob(@PathVariable Long id) {
        return jobService.deleteJob(id);
    }
}