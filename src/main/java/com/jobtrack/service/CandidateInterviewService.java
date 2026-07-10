package com.jobtrack.service;

import com.jobtrack.dto.InterviewResponse;
import com.jobtrack.entity.Interview;
import com.jobtrack.entity.User;
import com.jobtrack.repository.InterviewRepository;
import com.jobtrack.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CandidateInterviewService {

    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    public CandidateInterviewService(InterviewRepository interviewRepository,
                                     UserRepository userRepository) {
        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
    }

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<InterviewResponse> getMyInterviews() {
        User candidate = getLoggedInUser();
        return interviewRepository.findByCandidateId(candidate.getId())
                .stream()
                .map(InterviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public InterviewResponse getMyInterview(Long id) {
        User candidate = getLoggedInUser();
        Interview i = interviewRepository.findByIdAndCandidateId(id, candidate.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interview not found"));
        return InterviewResponse.fromEntity(i);
    }
}
