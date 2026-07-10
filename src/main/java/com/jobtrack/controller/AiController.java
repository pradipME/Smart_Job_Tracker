package com.jobtrack.controller;

import com.jobtrack.dto.ai.*;
import com.jobtrack.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/parse-resume")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParseResumeResponse> parseResume(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(aiService.parseResume(file));
    }

    @PostMapping("/match-resume")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchResumeResponse> matchResume(@RequestBody MatchResumeRequest request) {
        return ResponseEntity.ok(aiService.matchResume(request));
    }

    @PostMapping("/recruiter-summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RecruiterSummaryResponse> generateSummary(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(aiService.generateSummary(
                body.get("resumeText"),
                body.get("jobDescription")
        ));
    }

    @PostMapping("/rank-candidates")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RankCandidatesResponse> rankCandidates(@RequestBody RankCandidatesRequest request) {
        return ResponseEntity.ok(aiService.rankCandidates(request));
    }

    @PostMapping("/generate-questions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GenerateQuestionsResponse> generateQuestions(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(aiService.generateQuestions(
                body.get("resumeText"),
                body.get("jobDescription")
        ));
    }

    @PostMapping("/review-cover-letter")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CoverLetterReviewResponse> reviewCoverLetter(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(aiService.reviewCoverLetter(body.get("coverLetter")));
    }

    @PostMapping("/skill-gap")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SkillGapResponse> analyzeSkillGap(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(aiService.analyzeSkillGap(
                body.get("resumeText"),
                body.get("jobDescription")
        ));
    }
}
