package com.jobtrack.controller;

import com.jobtrack.dto.JobListingRequest;
import com.jobtrack.dto.JobListingResponse;
import com.jobtrack.entity.EmploymentType;
import com.jobtrack.entity.JobListingStatus;
import com.jobtrack.entity.WorkMode;
import com.jobtrack.service.JobListingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/jobs")
@PreAuthorize("hasRole('ADMIN')")
public class JobListingController {

    private final JobListingService jobListingService;

    public JobListingController(JobListingService jobListingService) {
        this.jobListingService = jobListingService;
    }

    @GetMapping
    public ResponseEntity<Page<JobListingResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(jobListingService.getAllPaginated(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobListingResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(jobListingService.getById(id));
    }

    @PostMapping
    public ResponseEntity<JobListingResponse> create(@Valid @RequestBody JobListingRequest request) {
        JobListingResponse response = jobListingService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobListingResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody JobListingRequest request) {
        return ResponseEntity.ok(jobListingService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        jobListingService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<JobListingResponse>> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(jobListingService.search(title, company, location, page, size));
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<JobListingResponse>> filter(
            @RequestParam(required = false) JobListingStatus status,
            @RequestParam(required = false) EmploymentType employmentType,
            @RequestParam(required = false) WorkMode workMode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(jobListingService.filter(status, employmentType, workMode, page, size));
    }
}
