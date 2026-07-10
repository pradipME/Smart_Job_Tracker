package com.jobtrack.controller;

import com.jobtrack.dto.*;
import com.jobtrack.service.AdminAssessmentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/assessments")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAssessmentController {

    private final AdminAssessmentService adminAssessmentService;

    public AdminAssessmentController(AdminAssessmentService adminAssessmentService) {
        this.adminAssessmentService = adminAssessmentService;
    }

    @GetMapping
    public ResponseEntity<Page<AssessmentResponse>> getAssessments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminAssessmentService.getAssessments(search, status, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssessmentResponse> getAssessment(@PathVariable Long id) {
        return ResponseEntity.ok(adminAssessmentService.getAssessment(id));
    }

    @PostMapping
    public ResponseEntity<AssessmentResponse> createAssessment(@Valid @RequestBody AssessmentRequest request) {
        return ResponseEntity.ok(adminAssessmentService.createAssessment(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssessmentResponse> updateAssessment(
            @PathVariable Long id,
            @Valid @RequestBody AssessmentRequest request) {
        return ResponseEntity.ok(adminAssessmentService.updateAssessment(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAssessment(@PathVariable Long id) {
        adminAssessmentService.deleteAssessment(id);
        return ResponseEntity.ok(Map.of("message", "Assessment deleted successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AssessmentResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminAssessmentService.updateStatus(id, body.get("status")));
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<List<AssessmentResultResponse>> getResults(@PathVariable Long id) {
        return ResponseEntity.ok(adminAssessmentService.getAssessmentResults(id));
    }
}
