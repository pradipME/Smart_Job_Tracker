package com.jobtrack.controller;

import com.jobtrack.dto.JobListingResponse;
import com.jobtrack.entity.EmploymentType;
import com.jobtrack.entity.WorkMode;
import com.jobtrack.service.JobListingService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs/listings")
public class CandidateJobController {

    private final JobListingService jobListingService;

    public CandidateJobController(JobListingService jobListingService) {
        this.jobListingService = jobListingService;
    }

    @GetMapping
    public ResponseEntity<Page<JobListingResponse>> getOpenJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) EmploymentType employmentType,
            @RequestParam(required = false) WorkMode workMode,
            @RequestParam(required = false) String experience,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(jobListingService.getOpenJobs(
                title, company, location, employmentType, workMode, experience, sort, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobListingResponse> getOpenJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobListingService.getOpenJobById(id));
    }
}
