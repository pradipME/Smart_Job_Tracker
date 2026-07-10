package com.jobtrack.controller;

import com.jobtrack.dto.*;
import com.jobtrack.service.CandidateAssessmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@PreAuthorize("hasRole('CANDIDATE')")
public class CandidateAssessmentController {

    private final CandidateAssessmentService candidateAssessmentService;

    public CandidateAssessmentController(CandidateAssessmentService candidateAssessmentService) {
        this.candidateAssessmentService = candidateAssessmentService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<AttemptResponse>> getMyAssessments() {
        return ResponseEntity.ok(candidateAssessmentService.getMyAssessments());
    }

    @PostMapping("/{appAssessmentId}/start")
    public ResponseEntity<AttemptResponse> startAssessment(@PathVariable Long appAssessmentId) {
        return ResponseEntity.ok(candidateAssessmentService.startAssessment(appAssessmentId));
    }

    @PostMapping("/{appAssessmentId}/submit")
    public ResponseEntity<SubmitResponse> submitAssessment(
            @PathVariable Long appAssessmentId,
            @Valid @RequestBody SubmitRequest request) {
        return ResponseEntity.ok(candidateAssessmentService.submitAssessment(appAssessmentId, request));
    }

    @GetMapping("/{appAssessmentId}/result")
    public ResponseEntity<SubmitResponse> getMyResult(@PathVariable Long appAssessmentId) {
        return ResponseEntity.ok(candidateAssessmentService.getMyResult(appAssessmentId));
    }
}
