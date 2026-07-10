package com.jobtrack.controller;

import com.jobtrack.dto.*;
import com.jobtrack.service.AdminApplicationService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/applications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminApplicationController {

    private final AdminApplicationService adminApplicationService;

    public AdminApplicationController(AdminApplicationService adminApplicationService) {
        this.adminApplicationService = adminApplicationService;
    }

    @GetMapping
    public ResponseEntity<Page<AdminApplicationSummaryResponse>> getApplications(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) Long jobId,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                adminApplicationService.getApplications(search, status, companyId, jobId, sort, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminApplicationDetailResponse> getApplicationDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminApplicationService.getApplicationDetail(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AdminApplicationDetailResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(adminApplicationService.updateStatus(id, request));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ApplicationHistoryResponse>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(adminApplicationService.getHistory(id));
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<NoteResponse> addNote(
            @PathVariable Long id,
            @Valid @RequestBody NoteRequest request) {
        return ResponseEntity.ok(adminApplicationService.addNote(id, request));
    }

    @GetMapping("/{id}/notes")
    public ResponseEntity<List<NoteResponse>> getNotes(@PathVariable Long id) {
        return ResponseEntity.ok(adminApplicationService.getNotes(id));
    }

    @PutMapping("/{id}/notes/{noteId}")
    public ResponseEntity<NoteResponse> updateNote(
            @PathVariable Long id,
            @PathVariable Long noteId,
            @Valid @RequestBody NoteRequest request) {
        return ResponseEntity.ok(adminApplicationService.updateNote(id, noteId, request));
    }

    @DeleteMapping("/{id}/notes/{noteId}")
    public ResponseEntity<Map<String, String>> deleteNote(
            @PathVariable Long id,
            @PathVariable Long noteId) {
        adminApplicationService.deleteNote(id, noteId);
        return ResponseEntity.ok(Map.of("message", "Note deleted successfully"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminApplicationService.getDashboardStats());
    }

    @GetMapping("/resume/{applicationId}")
    public ResponseEntity<Resource> getResume(@PathVariable Long applicationId) {
        Resource resource = adminApplicationService.getResumeFile(applicationId);
        String contentType = "application/pdf";
        String filename = resource.getFilename();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
