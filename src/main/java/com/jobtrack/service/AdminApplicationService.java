package com.jobtrack.service;

import com.jobtrack.dto.*;
import com.jobtrack.entity.*;
import com.jobtrack.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationHistoryRepository historyRepository;
    private final RecruiterNoteRepository noteRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final ApplicationAssessmentRepository appAssessmentRepository;
    private final AssessmentRepository assessmentRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public AdminApplicationService(ApplicationRepository applicationRepository,
                                   ApplicationHistoryRepository historyRepository,
                                   RecruiterNoteRepository noteRepository,
                                   CompanyRepository companyRepository,
                                   UserRepository userRepository,
                                   ApplicationAssessmentRepository appAssessmentRepository,
                                   AssessmentRepository assessmentRepository) {
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.noteRepository = noteRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.appAssessmentRepository = appAssessmentRepository;
        this.assessmentRepository = assessmentRepository;
    }

    private String getLoggedInUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    public Page<AdminApplicationSummaryResponse> getApplications(
            String search, String status, Long companyId, Long jobId,
            String sort, int page, int size) {

        ApplicationStatus statusEnum = null;
        if (status != null && !status.isEmpty()) {
            try {
                statusEnum = ApplicationStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Sort sorting;
        if ("candidateName".equals(sort)) {
            sorting = Sort.by("candidate.fullName");
        } else if ("company".equals(sort)) {
            sorting = Sort.by("job.company.name");
        } else if ("oldest".equals(sort)) {
            sorting = Sort.by("appliedAt").ascending();
        } else {
            sorting = Sort.by("appliedAt").descending();
        }

        Pageable pageable = PageRequest.of(page, size, sorting);

        String searchParam = (search != null && !search.isEmpty()) ? search : null;
        Long companyParam = companyId;
        Long jobParam = jobId;

        Page<Application> apps = applicationRepository.findAdminApplications(
                searchParam, statusEnum, companyParam, jobParam, pageable);

        return apps.map(AdminApplicationSummaryResponse::fromEntity);
    }

    public AdminApplicationDetailResponse getApplicationDetail(Long id) {
        Application app = applicationRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        List<ApplicationHistoryResponse> history = historyRepository
                .findByApplicationIdOrderByChangedAtAsc(id)
                .stream()
                .map(ApplicationHistoryResponse::fromEntity)
                .toList();

        List<NoteResponse> notes = noteRepository
                .findByApplicationIdOrderByCreatedAtDesc(id)
                .stream()
                .map(NoteResponse::fromEntity)
                .toList();

        return AdminApplicationDetailResponse.fromEntity(app, history, notes);
    }

    @Transactional
    public AdminApplicationDetailResponse updateStatus(Long id, StatusUpdateRequest request) {
        Application app = applicationRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        ApplicationStatus fromStatus = app.getStatus();
        ApplicationStatus toStatus = request.getStatus();

        if (fromStatus == toStatus) {
            throw new IllegalArgumentException("Application is already in " + toStatus + " status");
        }

        String email = getLoggedInUserEmail();
        app.setStatus(toStatus);
        applicationRepository.save(app);

        ApplicationHistory history = new ApplicationHistory();
        history.setApplicationId(app.getId());
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setChangedBy(email);
        history.setComment(request.getComment());
        historyRepository.save(history);

        if (toStatus == ApplicationStatus.ASSESSMENT_ASSIGNED) {
            if (appAssessmentRepository.existsByApplicationIdAndDeletedFalse(id)) {
                throw new IllegalArgumentException("Assessment already assigned to this application");
            }

            Assessment assessment;
            if (request.getAssessmentId() != null) {
                assessment = assessmentRepository.findByIdAndDeletedFalse(request.getAssessmentId())
                        .orElseThrow(() -> new IllegalArgumentException("Assessment not found"));
                if (assessment.getStatus() != AssessmentStatus.PUBLISHED) {
                    throw new IllegalArgumentException("Assessment must be published before assigning");
                }
            } else {
                assessment = assessmentRepository.findFirstByStatusAndDeletedFalse(AssessmentStatus.PUBLISHED)
                        .orElseThrow(() -> new IllegalArgumentException("No published assessment available. Please create and publish an assessment first."));
            }

            ApplicationAssessment aa = new ApplicationAssessment();
            aa.setApplicationId(id);
            aa.setAssessment(assessment);
            aa.setCandidateId(app.getCandidate().getId());
            aa.setStatus(AttemptStatus.ASSIGNED);
            appAssessmentRepository.save(aa);
        }

        return getApplicationDetail(id);
    }

    public List<ApplicationHistoryResponse> getHistory(Long id) {
        if (!applicationRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found");
        }
        return historyRepository.findByApplicationIdOrderByChangedAtAsc(id)
                .stream()
                .map(ApplicationHistoryResponse::fromEntity)
                .toList();
    }

    @Transactional
    public NoteResponse addNote(Long applicationId, NoteRequest request) {
        Application app = applicationRepository.findByIdAndDeletedFalse(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        RecruiterNote note = new RecruiterNote();
        note.setApplicationId(applicationId);
        note.setContent(request.getContent());
        note.setCreatedBy(getLoggedInUserEmail());
        return NoteResponse.fromEntity(noteRepository.save(note));
    }

    public List<NoteResponse> getNotes(Long applicationId) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found");
        }
        return noteRepository.findByApplicationIdOrderByCreatedAtDesc(applicationId)
                .stream()
                .map(NoteResponse::fromEntity)
                .toList();
    }

    @Transactional
    public NoteResponse updateNote(Long applicationId, Long noteId, NoteRequest request) {
        RecruiterNote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found"));

        if (!note.getApplicationId().equals(applicationId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Note does not belong to this application");
        }

        note.setContent(request.getContent());
        return NoteResponse.fromEntity(noteRepository.save(note));
    }

    @Transactional
    public void deleteNote(Long applicationId, Long noteId) {
        RecruiterNote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found"));

        if (!note.getApplicationId().equals(applicationId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Note does not belong to this application");
        }

        noteRepository.delete(note);
    }

    public AdminDashboardStatsResponse getDashboardStats() {
        AdminDashboardStatsResponse stats = new AdminDashboardStatsResponse();

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);

        stats.setApplicationsToday(applicationRepository.countByDeletedFalseAndAppliedAtAfter(todayStart));
        stats.setPendingReview(applicationRepository.countByDeletedFalseAndStatus(ApplicationStatus.APPLIED));
        stats.setInterviewScheduled(applicationRepository.countByDeletedFalseAndStatus(ApplicationStatus.INTERVIEW_SCHEDULED));
        stats.setSelected(applicationRepository.countByDeletedFalseAndStatus(ApplicationStatus.SELECTED));
        stats.setRejected(applicationRepository.countByDeletedFalseAndStatus(ApplicationStatus.REJECTED));

        List<Object[]> byStatus = applicationRepository.countByStatusGroup();
        stats.setByStatus(byStatus.stream()
                .map(row -> new AdminDashboardStatsResponse.StatusCount(
                        ((ApplicationStatus) row[0]).name(), ((Number) row[1]).longValue()))
                .collect(Collectors.toList()));

        List<Object[]> byCompany = applicationRepository.countByCompanyGroup();
        stats.setByCompany(byCompany.stream()
                .map(row -> new AdminDashboardStatsResponse.CompanyCount(
                        (String) row[0], ((Number) row[1]).longValue()))
                .collect(Collectors.toList()));

        List<Object[]> monthly = applicationRepository.countMonthly();
        stats.setMonthly(monthly.stream()
                .map(row -> new AdminDashboardStatsResponse.MonthlyCount(
                        ((Number) row[0]).intValue(), ((Number) row[1]).intValue(), ((Number) row[2]).longValue()))
                .collect(Collectors.toList()));

        return stats;
    }

    public Resource getResumeFile(Long applicationId) {
        Application app = applicationRepository.findByIdAndDeletedFalse(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        String fileName = app.getResumeUrl();
        Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
        Resource resource = new FileSystemResource(filePath.toFile());

        if (!resource.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume file not found");
        }

        return resource;
    }
}
