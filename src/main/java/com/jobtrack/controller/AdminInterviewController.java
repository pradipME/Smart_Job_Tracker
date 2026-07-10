package com.jobtrack.controller;

import com.jobtrack.dto.*;
import com.jobtrack.service.AdminInterviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/interviews")
@PreAuthorize("hasRole('ADMIN')")
public class AdminInterviewController {

    private final AdminInterviewService adminInterviewService;

    public AdminInterviewController(AdminInterviewService adminInterviewService) {
        this.adminInterviewService = adminInterviewService;
    }

    @GetMapping
    public ResponseEntity<Page<InterviewResponse>> getInterviews(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String mode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminInterviewService.getInterviews(search, status, mode, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewResponse> getInterview(@PathVariable Long id) {
        return ResponseEntity.ok(adminInterviewService.getInterview(id));
    }

    @PostMapping
    public ResponseEntity<InterviewResponse> createInterview(@Valid @RequestBody InterviewRequest request) {
        return ResponseEntity.ok(adminInterviewService.createInterview(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InterviewResponse> updateInterview(
            @PathVariable Long id,
            @Valid @RequestBody InterviewRequest request) {
        return ResponseEntity.ok(adminInterviewService.updateInterview(id, request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<InterviewResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String status = (String) body.get("status");
        String feedback = (String) body.get("feedback");
        Integer rating = body.get("rating") != null ? ((Number) body.get("rating")).intValue() : null;
        return ResponseEntity.ok(adminInterviewService.updateStatus(id, status, feedback, rating));
    }

    @PutMapping("/{id}/feedback")
    public ResponseEntity<InterviewResponse> addFeedback(
            @PathVariable Long id,
            @Valid @RequestBody InterviewFeedbackRequest request) {
        return ResponseEntity.ok(adminInterviewService.addFeedback(id, request));
    }

    @GetMapping("/calendar/date")
    public ResponseEntity<List<InterviewResponse>> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(adminInterviewService.getInterviewsByDate(date));
    }

    @GetMapping("/calendar/range")
    public ResponseEntity<List<InterviewResponse>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(adminInterviewService.getInterviewsByDateRange(start, end));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(adminInterviewService.getDashboardStats());
    }
}
