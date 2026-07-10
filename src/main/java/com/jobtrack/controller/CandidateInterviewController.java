package com.jobtrack.controller;

import com.jobtrack.dto.InterviewResponse;
import com.jobtrack.service.CandidateInterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@PreAuthorize("hasRole('CANDIDATE')")
public class CandidateInterviewController {

    private final CandidateInterviewService candidateInterviewService;

    public CandidateInterviewController(CandidateInterviewService candidateInterviewService) {
        this.candidateInterviewService = candidateInterviewService;
    }

    @GetMapping
    public ResponseEntity<List<InterviewResponse>> getMyInterviews() {
        return ResponseEntity.ok(candidateInterviewService.getMyInterviews());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewResponse> getMyInterview(@PathVariable Long id) {
        return ResponseEntity.ok(candidateInterviewService.getMyInterview(id));
    }
}
