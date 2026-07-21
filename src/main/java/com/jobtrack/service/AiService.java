package com.jobtrack.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtrack.config.OpenAIConfig;
import com.jobtrack.dto.ai.*;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class AiService {

    private final RestTemplate restTemplate;
    private final OpenAIConfig openAIConfig;
    private final ObjectMapper objectMapper;

    public AiService(RestTemplate restTemplate, OpenAIConfig openAIConfig, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.openAIConfig = openAIConfig;
        this.objectMapper = objectMapper;
    }

    private String extractTextFromPdf(MultipartFile file) {
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse PDF: " + e.getMessage(), e);
        }
    }

    private void ensureAiConfigured() {
        if (!openAIConfig.isConfigured()) {
            throw new RuntimeException("AI service is not configured. Set OPENAI_API_KEY environment variable.");
        }
    }

    private String callOpenAI(String systemPrompt, String userMessage) {
        ensureAiConfigured();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAIConfig.getApiKey());

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", openAIConfig.getModel());
        requestBody.put("response_format", Map.of("type", "json_object"));

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", userMessage));
        requestBody.put("messages", messages);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    openAIConfig.getApiUrl(), HttpMethod.POST, entity, Map.class);

            Map<String, Object> body = response.getBody();
            if (body == null || !body.containsKey("choices")) {
                throw new RuntimeException("OpenAI returned an empty response");
            }

            List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            throw new RuntimeException("AI service failed: " + e.getMessage(), e);
        }
    }

    @Cacheable(value = "aiCache", key = "'parseResume:' + #file.originalFilename")
    public ParseResumeResponse parseResume(MultipartFile file) {
        String text = extractTextFromPdf(file);

        String systemPrompt = "You are a resume parser. Extract structured information from the resume text. " +
                "Return JSON with fields: name (string), skills (array of strings), education (array of strings), " +
                "experience (array of strings), projects (array of strings), certificates (array of strings), " +
                "technologies (array of strings). If a field is not found, return an empty array.";

        String response = callOpenAI(systemPrompt, "Parse this resume:\n\n" + text);

        try {
            return objectMapper.readValue(response, ParseResumeResponse.class);
        } catch (Exception e) {
            ParseResumeResponse fallback = new ParseResumeResponse();
            fallback.setName("Parse failed");
            fallback.setSkills(List.of("Could not parse resume"));
            return fallback;
        }
    }

    @Cacheable(value = "aiCache", key = "'matchResume:' + #request.resumeText.hashCode() + ':' + #request.jobDescription.hashCode()")
    public MatchResumeResponse matchResume(MatchResumeRequest request) {
        String systemPrompt = "You are a resume-job matching AI. Compare the resume with the job description. " +
                "Return JSON with fields: matchPercentage (integer 0-100), strengths (array of strings), " +
                "weaknesses (array of strings), missingSkills (array of strings). Be objective and realistic.";

        String userMessage = "Resume:\n" + request.getResumeText() + "\n\nJob Description:\n" + request.getJobDescription();

        String response = callOpenAI(systemPrompt, userMessage);

        try {
            return objectMapper.readValue(response, MatchResumeResponse.class);
        } catch (Exception e) {
            MatchResumeResponse fallback = new MatchResumeResponse();
            fallback.setMatchPercentage(0);
            fallback.setStrengths(List.of("Analysis unavailable"));
            return fallback;
        }
    }

    @Cacheable(value = "aiCache", key = "'summary:' + #resumeText.hashCode() + ':' + (#jobDescription != null ? #jobDescription.hashCode() : 'none')")
    public RecruiterSummaryResponse generateSummary(String resumeText, String jobDescription) {
        String systemPrompt = "You are an AI recruiter. Write a 2-3 paragraph professional summary of the candidate " +
                "based on their resume and the job description. Highlight strengths, note areas for improvement, " +
                "and give a recommendation. Return JSON with a single field: summary (string).";

        String userMessage = "Resume:\n" + resumeText + "\n\nJob Description:\n" + (jobDescription != null ? jobDescription : "Not provided");

        String response = callOpenAI(systemPrompt, userMessage);

        try {
            return objectMapper.readValue(response, RecruiterSummaryResponse.class);
        } catch (Exception e) {
            RecruiterSummaryResponse fallback = new RecruiterSummaryResponse();
            fallback.setSummary("Summary generation is currently unavailable.");
            return fallback;
        }
    }

    @Cacheable(value = "aiCache", key = "'rank:' + #request.jobDescription.hashCode() + ':' + #request.candidates.size()")
    public RankCandidatesResponse rankCandidates(RankCandidatesRequest request) {
        StringBuilder candidateText = new StringBuilder();
        for (RankCandidatesRequest.CandidateData c : request.getCandidates()) {
            candidateText.append("Candidate ID: ").append(c.getId())
                    .append("\nName: ").append(c.getName())
                    .append("\nResume: ").append(c.getResumeText())
                    .append("\n---\n");
        }

        String systemPrompt = "You are an AI talent ranker. Rank the following candidates for the given job description. " +
                "Return JSON with a single field: rankedCandidates (array of objects with fields: id (number), name (string), " +
                "score (integer 0-100), reasoning (string)). Sort best candidate first.";

        String userMessage = "Job Description:\n" + request.getJobDescription() + "\n\nCandidates:\n" + candidateText;

        String response = callOpenAI(systemPrompt, userMessage);

        try {
            return objectMapper.readValue(response, RankCandidatesResponse.class);
        } catch (Exception e) {
            RankCandidatesResponse fallback = new RankCandidatesResponse();
            return fallback;
        }
    }

    @Cacheable(value = "aiCache", key = "'questions:' + #jobDescription.hashCode() + ':' + (#resumeText != null ? #resumeText.hashCode() : 'none')")
    public GenerateQuestionsResponse generateQuestions(String resumeText, String jobDescription) {
        String systemPrompt = "You are an AI interview question generator. Generate interview questions based on the " +
                "job description and candidate resume. Return JSON with a single field: questions (object with keys: " +
                "'technical' (array of 3 strings), 'behavioral' (array of 3 strings), 'hr' (array of 3 strings)). " +
                "Questions should be specific and relevant.";

        String userMessage = "Job Description:\n" + jobDescription + "\n\nResume:\n" + (resumeText != null ? resumeText : "Not provided");

        String response = callOpenAI(systemPrompt, userMessage);

        try {
            return objectMapper.readValue(response, GenerateQuestionsResponse.class);
        } catch (Exception e) {
            GenerateQuestionsResponse fallback = new GenerateQuestionsResponse();
            fallback.setQuestions(Map.of(
                    "technical", List.of("Question generation unavailable"),
                    "behavioral", List.of("Question generation unavailable"),
                    "hr", List.of("Question generation unavailable")
            ));
            return fallback;
        }
    }

    @Cacheable(value = "aiCache", key = "'coverLetter:' + #coverLetter.hashCode()")
    public CoverLetterReviewResponse reviewCoverLetter(String coverLetter) {
        String systemPrompt = "You are an AI cover letter reviewer. Analyze the cover letter for grammar issues, " +
                "professionalism, and provide suggestions for improvement. " +
                "Return JSON with fields: grammarIssues (array of strings), professionalismScore (string like 'Excellent'/'Good'/'Average'/'Poor'), " +
                "suggestions (array of strings).";

        String userMessage = "Review this cover letter:\n\n" + coverLetter;

        String response = callOpenAI(systemPrompt, userMessage);

        try {
            return objectMapper.readValue(response, CoverLetterReviewResponse.class);
        } catch (Exception e) {
            CoverLetterReviewResponse fallback = new CoverLetterReviewResponse();
            fallback.setProfessionalismScore("Unavailable");
            fallback.setSuggestions(List.of("Review service is currently unavailable"));
            return fallback;
        }
    }

    @Cacheable(value = "aiCache", key = "'skillGap:' + #resumeText.hashCode() + ':' + #jobDescription.hashCode()")
    public SkillGapResponse analyzeSkillGap(String resumeText, String jobDescription) {
        String systemPrompt = "You are an AI skill gap analyst. Compare the candidate's resume against the job description " +
                "to identify missing skills and provide learning recommendations. " +
                "Return JSON with fields: missingSkills (array of strings), recommendations (array of strings).";

        String userMessage = "Resume:\n" + resumeText + "\n\nJob Description:\n" + jobDescription;

        String response = callOpenAI(systemPrompt, userMessage);

        try {
            return objectMapper.readValue(response, SkillGapResponse.class);
        } catch (Exception e) {
            SkillGapResponse fallback = new SkillGapResponse();
            fallback.setMissingSkills(List.of("Analysis unavailable"));
            return fallback;
        }
    }
}
