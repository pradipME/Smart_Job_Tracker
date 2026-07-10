package com.jobtrack.repository;

import com.jobtrack.entity.EmploymentType;
import com.jobtrack.entity.JobListing;
import com.jobtrack.entity.JobListingStatus;
import com.jobtrack.entity.WorkMode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobListingRepository extends JpaRepository<JobListing, Long> {

    List<JobListing> findByDeletedFalse();

    Page<JobListing> findByDeletedFalse(Pageable pageable);

    Optional<JobListing> findByIdAndDeletedFalse(Long id);

    @Query("SELECT j FROM JobListing j WHERE j.deleted = false AND " +
           "(:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:company IS NULL OR LOWER(j.company.name) LIKE LOWER(CONCAT('%', :company, '%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))")
    Page<JobListing> search(@Param("title") String title,
                            @Param("company") String company,
                            @Param("location") String location,
                            Pageable pageable);

    @Query("SELECT j FROM JobListing j WHERE j.deleted = false AND " +
           "(:status IS NULL OR j.status = :status) AND " +
           "(:employmentType IS NULL OR j.employmentType = :employmentType) AND " +
           "(:workMode IS NULL OR j.workMode = :workMode)")
    Page<JobListing> filter(@Param("status") JobListingStatus status,
                            @Param("employmentType") EmploymentType employmentType,
                            @Param("workMode") WorkMode workMode,
                            Pageable pageable);

    @Query("SELECT j FROM JobListing j WHERE j.deleted = false AND j.status = 'OPEN' AND " +
           "(:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:company IS NULL OR LOWER(j.company.name) LIKE LOWER(CONCAT('%', :company, '%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:employmentType IS NULL OR j.employmentType = :employmentType) AND " +
           "(:workMode IS NULL OR j.workMode = :workMode) AND " +
           "(:experience IS NULL OR LOWER(j.experience) LIKE LOWER(CONCAT('%', :experience, '%')))")
    Page<JobListing> findOpenJobs(@Param("title") String title,
                                  @Param("company") String company,
                                  @Param("location") String location,
                                  @Param("employmentType") EmploymentType employmentType,
                                  @Param("workMode") WorkMode workMode,
                                  @Param("experience") String experience,
                                  Pageable pageable);

    @Query("SELECT j FROM JobListing j WHERE j.deleted = false AND j.status = 'OPEN' AND j.id = :id")
    java.util.Optional<JobListing> findOpenJobById(@Param("id") Long id);
}
