package com.jobtrack.service;

import com.jobtrack.dto.DashboardResponse;
import com.jobtrack.dto.JobRequest;
import com.jobtrack.entity.*;
import com.jobtrack.repository.ApplicationRepository;
import com.jobtrack.repository.JobApplicationRepository;
import com.jobtrack.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobApplicationRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public JobService(JobApplicationRepository jobRepository,
                      ApplicationRepository applicationRepository,
                      UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    private User getLoggedInUser() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User Not Found"));
    }

    // Add Job
    public String addJob(JobRequest request) {

        User user = getLoggedInUser();

        JobApplication job = new JobApplication();

        job.setCompany(request.getCompany());
        job.setJobTitle(request.getJobTitle());
        job.setLocation(request.getLocation());
        job.setStatus(request.getStatus());
        job.setAppliedDate(request.getAppliedDate());
        job.setInterviewDate(request.getInterviewDate());
        job.setNotes(request.getNotes());
        job.setUser(user);

        jobRepository.save(job);

        return "Job Added Successfully";
    }

    // Get All Jobs
    public List<JobApplication> getAllJobs() {

        User user = getLoggedInUser();

        return jobRepository.findByUser(user);
    }

    // Pagination
    public Page<JobApplication> getJobs(int page, int size) {
        User user = getLoggedInUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        return applicationRepository.findByCandidateIdAndDeletedFalse(user.getId(), pageable)
                .map(this::toJobApplication);
    }

    // Search
    public List<JobApplication> searchJobs(String company) {

        User user = getLoggedInUser();

        return jobRepository.findByUserAndCompanyContainingIgnoreCase(user, company);
    }

    // Filter
    public List<JobApplication> filterJobs(JobStatus status) {

        User user = getLoggedInUser();

        return jobRepository.findByUserAndStatus(user, status);
    }

    // Dashboard
    public DashboardResponse getDashboard() {
        User user = getLoggedInUser();

        if (user.getRole() == Role.ADMIN) {
            long total = applicationRepository.countByDeletedFalse();
            long applied = applicationRepository.countByDeletedFalseAndStatus(ApplicationStatus.APPLIED);
            long interview = applicationRepository.countByDeletedFalseAndStatus(ApplicationStatus.INTERVIEW_SCHEDULED)
                    + applicationRepository.countByDeletedFalseAndStatus(ApplicationStatus.HR_ROUND);
            long offer = applicationRepository.countByDeletedFalseAndStatus(ApplicationStatus.SELECTED);
            long rejected = applicationRepository.countByDeletedFalseAndStatus(ApplicationStatus.REJECTED);
            return new DashboardResponse(total, applied, interview, offer, rejected);
        }

        List<Application> apps = applicationRepository.findByCandidateIdAndDeletedFalse(user.getId());
        long total = apps.size();
        long applied = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.APPLIED).count();
        long interview = apps.stream().filter(a ->
                a.getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED ||
                a.getStatus() == ApplicationStatus.HR_ROUND
        ).count();
        long offer = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.SELECTED).count();
        long rejected = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.REJECTED).count();
        return new DashboardResponse(total, applied, interview, offer, rejected);
    }

    // Get By Id
    public JobApplication getJobById(Long id) {

        User user = getLoggedInUser();

        return jobRepository.findByIdAndUser(id, user)
                .orElse(null);
    }

    // Update
    public String updateJob(Long id, JobRequest request) {

        User user = getLoggedInUser();

        JobApplication job = jobRepository
                .findByIdAndUser(id, user)
                .orElse(null);

        if (job == null) {
            return "Job Not Found";
        }

        job.setCompany(request.getCompany());
        job.setJobTitle(request.getJobTitle());
        job.setLocation(request.getLocation());
        job.setStatus(request.getStatus());
        job.setAppliedDate(request.getAppliedDate());
        job.setInterviewDate(request.getInterviewDate());
        job.setNotes(request.getNotes());

        jobRepository.save(job);

        return "Job Updated Successfully";
    }

    // Delete
    public String deleteJob(Long id) {

        User user = getLoggedInUser();

        JobApplication job = jobRepository
                .findByIdAndUser(id, user)
                .orElse(null);

        if (job == null) {
            return "Job Not Found";
        }

        jobRepository.delete(job);

        return "Job Deleted Successfully";
    }

    private JobApplication toJobApplication(Application app) {
        JobApplication job = new JobApplication();
        job.setId(app.getId());
        job.setCompany(app.getJob().getCompany().getName());
        job.setJobTitle(app.getJob().getTitle());
        job.setLocation(app.getJob().getLocation());
        job.setStatus(mapStatus(app.getStatus()));
        job.setAppliedDate(app.getAppliedAt().toLocalDate());
        job.setUser(app.getCandidate());
        return job;
    }

    private JobStatus mapStatus(ApplicationStatus status) {
        return switch (status) {
            case APPLIED -> JobStatus.APPLIED;
            case UNDER_REVIEW -> JobStatus.APPLIED;
            case ASSESSMENT_ASSIGNED -> JobStatus.INTERVIEW;
            case ASSESSMENT_COMPLETED -> JobStatus.INTERVIEW;
            case INTERVIEW_SCHEDULED -> JobStatus.INTERVIEW;
            case HR_ROUND -> JobStatus.INTERVIEW;
            case SELECTED -> JobStatus.OFFER;
            case REJECTED, WITHDRAWN -> JobStatus.REJECTED;
        };
    }
}
