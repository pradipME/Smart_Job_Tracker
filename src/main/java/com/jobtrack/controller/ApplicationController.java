package com.jobtrack.controller;

import com.jobtrack.dto.ApplicationRequest;
import com.jobtrack.dto.ApplicationResponse;
import com.jobtrack.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@PreAuthorize("hasRole('CANDIDATE')")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> apply(@Valid @RequestBody ApplicationRequest request) {
        ApplicationResponse response = applicationService.apply(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> getMyApplications() {
        return ResponseEntity.ok(applicationService.getMyApplications());
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<ApplicationResponse> getMyApplicationForJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(applicationService.getMyApplicationForJob(jobId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> withdraw(@PathVariable Long id) {
        applicationService.withdraw(id);
        return ResponseEntity.ok(Map.of("message", "Application withdrawn successfully"));
    }
}
