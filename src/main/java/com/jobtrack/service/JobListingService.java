package com.jobtrack.service;

import com.jobtrack.dto.JobListingRequest;
import com.jobtrack.dto.JobListingResponse;
import com.jobtrack.entity.*;
import com.jobtrack.repository.CompanyRepository;
import com.jobtrack.repository.JobListingRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class JobListingService {

    private final JobListingRepository jobListingRepository;
    private final CompanyRepository companyRepository;

    public JobListingService(JobListingRepository jobListingRepository,
                             CompanyRepository companyRepository) {
        this.jobListingRepository = jobListingRepository;
        this.companyRepository = companyRepository;
    }

    public JobListingResponse create(JobListingRequest request) {
        validateSalaryRange(request.getSalaryMin(), request.getSalaryMax());
        validateDeadline(request.getDeadline());

        Company company = companyRepository.findByIdAndDeletedFalse(request.getCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));

        JobListing job = new JobListing();
        mapRequestToEntity(request, job);
        job.setCompany(company);

        return JobListingResponse.fromEntity(jobListingRepository.save(job));
    }

    public JobListingResponse getById(Long id) {
        JobListing job = jobListingRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        return JobListingResponse.fromEntity(job);
    }

    public Page<JobListingResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return jobListingRepository.findByDeletedFalse(pageable)
                .map(JobListingResponse::fromEntity);
    }

    public Page<JobListingResponse> search(String title, String company, String location, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return jobListingRepository.search(
                blankToNull(title),
                blankToNull(company),
                blankToNull(location),
                pageable
        ).map(JobListingResponse::fromEntity);
    }

    public Page<JobListingResponse> filter(JobListingStatus status, EmploymentType employmentType,
                                            WorkMode workMode, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return jobListingRepository.filter(status, employmentType, workMode, pageable)
                .map(JobListingResponse::fromEntity);
    }

    public JobListingResponse update(Long id, JobListingRequest request) {
        validateSalaryRange(request.getSalaryMin(), request.getSalaryMax());
        validateDeadline(request.getDeadline());

        JobListing job = jobListingRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        Company company = companyRepository.findByIdAndDeletedFalse(request.getCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));

        mapRequestToEntity(request, job);
        job.setCompany(company);

        return JobListingResponse.fromEntity(jobListingRepository.save(job));
    }

    public Page<JobListingResponse> getOpenJobs(String title, String company, String location,
                                                  EmploymentType employmentType, WorkMode workMode,
                                                  String experience, String sortBy, int page, int size) {
        Sort sort = switch (sortBy != null ? sortBy : "newest") {
            case "oldest" -> Sort.by(Sort.Direction.ASC, "createdAt");
            case "deadline" -> Sort.by(Sort.Direction.ASC, "deadline");
            case "salary_high" -> Sort.by(Sort.Direction.DESC, "salaryMax");
            case "salary_low" -> Sort.by(Sort.Direction.ASC, "salaryMin");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
        Pageable pageable = PageRequest.of(page, size, sort);
        return jobListingRepository.findOpenJobs(
                blankToNull(title), blankToNull(company), blankToNull(location),
                employmentType, workMode, blankToNull(experience), pageable
        ).map(JobListingResponse::fromEntity);
    }

    public JobListingResponse getOpenJobById(Long id) {
        JobListing job = jobListingRepository.findOpenJobById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        return JobListingResponse.fromEntity(job);
    }

    public void delete(Long id) {
        JobListing job = jobListingRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setDeleted(true);
        jobListingRepository.save(job);
    }

    private void mapRequestToEntity(JobListingRequest request, JobListing job) {
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setExperience(request.getExperience());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setEmploymentType(request.getEmploymentType());
        job.setWorkMode(request.getWorkMode());
        job.setRequiredSkills(request.getRequiredSkills());
        job.setOpenings(request.getOpenings());
        job.setDeadline(request.getDeadline());
        job.setStatus(request.getStatus() != null ? request.getStatus() : JobListingStatus.DRAFT);
    }

    private void validateSalaryRange(Integer min, Integer max) {
        if (min != null && max != null && min > max) {
            throw new IllegalArgumentException("Salary min cannot be greater than salary max");
        }
    }

    private void validateDeadline(LocalDate deadline) {
        if (deadline != null && deadline.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Deadline cannot be in the past");
        }
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }
}
