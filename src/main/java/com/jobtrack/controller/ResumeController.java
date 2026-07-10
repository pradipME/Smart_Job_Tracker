package com.jobtrack.controller;

import com.jobtrack.dto.ResumeResponse;
import com.jobtrack.service.ResumeService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResumeResponse uploadResume(
            @RequestParam("file") MultipartFile file) throws Exception {

        return resumeService.uploadResume(file);
    }
}