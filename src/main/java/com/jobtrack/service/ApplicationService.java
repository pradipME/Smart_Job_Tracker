package com.jobtrack.service;

import com.jobtrack.dto.ApplicationRequest;
import com.jobtrack.dto.ApplicationResponse;
import com.jobtrack.entity.*;
import com.jobtrack.repository.ApplicationHistoryRepository;
import com.jobtrack.repository.ApplicationRepository;
import com.jobtrack.repository.JobListingRepository;
import com.jobtrack.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobListingRepository jobListingRepository;
    private final UserRepository userRepository;
    private final ApplicationHistoryRepository historyRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                              JobListingRepository jobListingRepository,
                              UserRepository userRepository,
                              ApplicationHistoryRepository historyRepository) {
        this.applicationRepository = applicationRepository;
        this.jobListingRepository = jobListingRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
    }

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public ApplicationResponse apply(ApplicationRequest request) {
        User candidate = getLoggedInUser();

        if (applicationRepository.existsByCandidateIdAndJobIdAndDeletedFalse(candidate.getId(), request.getJobId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already applied for this job");
        }

        JobListing job = jobListingRepository.findOpenJobById(request.getJobId())
                .orElseThrow(() -> new IllegalArgumentException("Job not found or not accepting applications"));

        Application app = new Application();
        app.setCandidate(candidate);
        app.setJob(job);
        app.setResumeUrl(request.getResumeUrl());
        app.setCoverLetter(request.getCoverLetter());
        app.setStatus(ApplicationStatus.APPLIED);

        Application saved = applicationRepository.save(app);

        recordHistory(saved.getId(), null, ApplicationStatus.APPLIED, candidate.getEmail(), "Application submitted");

        return ApplicationResponse.fromEntity(saved);
    }

    public List<ApplicationResponse> getMyApplications() {
        User candidate = getLoggedInUser();
        return applicationRepository.findByCandidateIdAndDeletedFalse(candidate.getId())
                .stream()
                .map(ApplicationResponse::fromEntity)
                .toList();
    }

    public ApplicationResponse getMyApplicationForJob(Long jobId) {
        User candidate = getLoggedInUser();
        Application app = applicationRepository.findByCandidateIdAndJobIdAndDeletedFalse(candidate.getId(), jobId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        return ApplicationResponse.fromEntity(app);
    }

    public ApplicationResponse getById(Long id) {
        User candidate = getLoggedInUser();
        Application app = applicationRepository.findByCandidateIdAndDeletedFalseAndId(candidate.getId(), id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        return ApplicationResponse.fromEntity(app);
    }

    @Transactional
    public void withdraw(Long id) {
        User candidate = getLoggedInUser();
        Application app = applicationRepository.findByCandidateIdAndDeletedFalseAndId(candidate.getId(), id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        ApplicationStatus fromStatus = app.getStatus();
        app.setDeleted(true);
        app.setStatus(ApplicationStatus.WITHDRAWN);
        applicationRepository.save(app);

        recordHistory(app.getId(), fromStatus, ApplicationStatus.WITHDRAWN, candidate.getEmail(), "Candidate withdrew application");
    }

    public void recordHistory(Long applicationId, ApplicationStatus fromStatus, ApplicationStatus toStatus, String changedBy, String comment) {
        ApplicationHistory history = new ApplicationHistory();
        history.setApplicationId(applicationId);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setChangedBy(changedBy);
        history.setComment(comment);
        historyRepository.save(history);
    }
}
