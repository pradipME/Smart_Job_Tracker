package com.jobtrack.service;

import com.jobtrack.dto.DashboardResponse;
import com.jobtrack.dto.JobRequest;
import com.jobtrack.entity.JobApplication;
import com.jobtrack.entity.JobStatus;
import com.jobtrack.entity.User;
import com.jobtrack.repository.JobApplicationRepository;
import com.jobtrack.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobApplicationRepository jobRepository;
    private final UserRepository userRepository;

    public JobService(JobApplicationRepository jobRepository,
                      UserRepository userRepository) {
        this.jobRepository = jobRepository;
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

        Pageable pageable = PageRequest.of(page, size);

        return jobRepository.findByUser(user, pageable);
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

        return new DashboardResponse(
                jobRepository.countByUser(user),
                jobRepository.countByUserAndStatus(user, JobStatus.APPLIED),
                jobRepository.countByUserAndStatus(user, JobStatus.INTERVIEW),
                jobRepository.countByUserAndStatus(user, JobStatus.OFFER),
                jobRepository.countByUserAndStatus(user, JobStatus.REJECTED)
        );
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
}