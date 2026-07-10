package com.jobtrack.repository;

import com.jobtrack.entity.JobApplication;
import com.jobtrack.entity.JobStatus;
import com.jobtrack.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUser(User user);

    Optional<JobApplication> findByIdAndUser(Long id, User user);

    void deleteByIdAndUser(Long id, User user);

    long countByUser(User user);

    long countByUserAndStatus(User user, JobStatus status);

    long countByStatus(JobStatus status);

    List<JobApplication> findByUserAndCompanyContainingIgnoreCase(User user, String company);

    List<JobApplication> findByUserAndStatus(User user, JobStatus status);

    Page<JobApplication> findByUser(User user, Pageable pageable);
}