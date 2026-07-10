package com.jobtrack.service;

import com.jobtrack.dto.*;
import com.jobtrack.entity.*;
import com.jobtrack.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminInterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;

    public AdminInterviewService(InterviewRepository interviewRepository,
                                 ApplicationRepository applicationRepository) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
    }

    public Page<InterviewResponse> getInterviews(String search, String status, String mode, int page, int size) {
        InterviewStatus statusEnum = null;
        if (status != null && !status.isEmpty()) {
            try { statusEnum = InterviewStatus.valueOf(status.toUpperCase()); } catch (IllegalArgumentException ignored) {}
        }
        InterviewMode modeEnum = null;
        if (mode != null && !mode.isEmpty()) {
            try { modeEnum = InterviewMode.valueOf(mode.toUpperCase()); } catch (IllegalArgumentException ignored) {}
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending().and(Sort.by("startTime").descending()));
        String searchParam = (search != null && !search.isEmpty()) ? search : null;

        return interviewRepository.searchInterviews(searchParam, statusEnum, modeEnum, pageable)
                .map(InterviewResponse::fromEntity);
    }

    public InterviewResponse getInterview(Long id) {
        Interview i = interviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interview not found"));
        return InterviewResponse.fromEntity(i);
    }

    @Transactional
    public InterviewResponse createInterview(InterviewRequest request) {
        Application app = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        validateInterview(request, null);

        Interview i = new Interview();
        i.setApplication(app);
        i.setInterviewerName(request.getInterviewerName());
        i.setInterviewerEmail(request.getInterviewerEmail());
        i.setDate(request.getDate());
        i.setStartTime(request.getStartTime());
        i.setEndTime(request.getEndTime());
        i.setMeetingLink(request.getMeetingLink());
        i.setLocation(request.getLocation());

        try { i.setMode(InterviewMode.valueOf(request.getMode().toUpperCase())); }
        catch (IllegalArgumentException e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid mode"); }

        try { i.setRound(InterviewRound.valueOf(request.getRound().toUpperCase())); }
        catch (IllegalArgumentException e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid round"); }

        i.setStatus(InterviewStatus.SCHEDULED);
        interviewRepository.save(i);

        return InterviewResponse.fromEntity(i);
    }

    @Transactional
    public InterviewResponse updateInterview(Long id, InterviewRequest request) {
        Interview i = interviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interview not found"));

        if (i.getStatus() != InterviewStatus.SCHEDULED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Can only edit scheduled interviews");
        }

        validateInterview(request, id);

        i.setInterviewerName(request.getInterviewerName());
        i.setInterviewerEmail(request.getInterviewerEmail());
        i.setDate(request.getDate());
        i.setStartTime(request.getStartTime());
        i.setEndTime(request.getEndTime());
        i.setMeetingLink(request.getMeetingLink());
        i.setLocation(request.getLocation());

        try { i.setMode(InterviewMode.valueOf(request.getMode().toUpperCase())); }
        catch (IllegalArgumentException e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid mode"); }

        try { i.setRound(InterviewRound.valueOf(request.getRound().toUpperCase())); }
        catch (IllegalArgumentException e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid round"); }

        interviewRepository.save(i);
        return InterviewResponse.fromEntity(i);
    }

    @Transactional
    public InterviewResponse updateStatus(Long id, String newStatus, String feedback, Integer rating) {
        Interview i = interviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interview not found"));

        InterviewStatus target;
        try { target = InterviewStatus.valueOf(newStatus.toUpperCase()); }
        catch (IllegalArgumentException e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status"); }

        if (i.getStatus() == InterviewStatus.SCHEDULED && (target == InterviewStatus.COMPLETED || target == InterviewStatus.CANCELLED || target == InterviewStatus.NO_SHOW)) {
            i.setStatus(target);
        } else if (i.getStatus() == InterviewStatus.COMPLETED && target == InterviewStatus.CANCELLED) {
            i.setStatus(target);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot transition from " + i.getStatus() + " to " + target);
        }

        if (feedback != null) i.setFeedback(feedback);
        if (rating != null && rating >= 1 && rating <= 5) i.setRating(rating);

        interviewRepository.save(i);
        return InterviewResponse.fromEntity(i);
    }

    @Transactional
    public InterviewResponse addFeedback(Long id, InterviewFeedbackRequest request) {
        Interview i = interviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interview not found"));

        if (i.getStatus() != InterviewStatus.SCHEDULED && i.getStatus() != InterviewStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot add feedback to this interview");
        }

        i.setFeedback(request.getFeedback());
        if (request.getRating() != null) i.setRating(request.getRating());

        InterviewStatus target;
        try { target = InterviewStatus.valueOf(request.getStatus().toUpperCase()); }
        catch (IllegalArgumentException e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status"); }

        i.setStatus(target);
        interviewRepository.save(i);
        return InterviewResponse.fromEntity(i);
    }

    public List<InterviewResponse> getInterviewsByDate(LocalDate date) {
        return interviewRepository.findByDate(date).stream()
                .map(InterviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<InterviewResponse> getInterviewsByDateRange(LocalDate start, LocalDate end) {
        return interviewRepository.findByDateRange(start, end).stream()
                .map(InterviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getDashboardStats() {
        LocalDate today = LocalDate.now();
        Map<String, Object> stats = new HashMap<>();
        stats.put("todayCount", interviewRepository.countScheduledOnDate(today));
        stats.put("upcomingCount", interviewRepository.findByStatus(InterviewStatus.SCHEDULED).stream()
                .filter(i -> !i.getDate().isBefore(today)).count());
        stats.put("completedCount", interviewRepository.findByStatus(InterviewStatus.COMPLETED).size());
        stats.put("cancelledCount", interviewRepository.findByStatus(InterviewStatus.CANCELLED).size());
        stats.put("noShowCount", interviewRepository.findByStatus(InterviewStatus.NO_SHOW).size());
        stats.put("todayInterviews", interviewRepository.findByDate(today).stream()
                .map(InterviewResponse::fromEntity)
                .collect(Collectors.toList()));
        return stats;
    }

    private void validateInterview(InterviewRequest request, Long excludeId) {
        if (request.getEndTime() != null && request.getStartTime() != null
                && !request.getEndTime().isAfter(request.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        if (request.getMode() != null) {
            InterviewMode mode;
            try { mode = InterviewMode.valueOf(request.getMode().toUpperCase()); }
            catch (IllegalArgumentException e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid mode"); }

            if (mode == InterviewMode.ONLINE && (request.getMeetingLink() == null || request.getMeetingLink().isBlank())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Meeting link is required for online interviews");
            }
            if (mode == InterviewMode.OFFLINE && (request.getLocation() == null || request.getLocation().isBlank())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Location is required for offline interviews");
            }
        }

        if (!interviewRepository.findOverlapping(
                request.getApplicationId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                excludeId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Interview time overlaps with an existing interview");
        }
    }
}
