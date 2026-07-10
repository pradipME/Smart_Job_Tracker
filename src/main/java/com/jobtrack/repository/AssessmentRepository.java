package com.jobtrack.repository;

import com.jobtrack.entity.Assessment;
import com.jobtrack.entity.AssessmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {

    Optional<Assessment> findByIdAndDeletedFalse(Long id);

    Optional<Assessment> findFirstByStatusAndDeletedFalse(AssessmentStatus status);

    Page<Assessment> findByDeletedFalse(Pageable pageable);

    @Query("SELECT a FROM Assessment a WHERE a.deleted = false AND " +
           "(:search IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR a.status = :status)")
    Page<Assessment> searchAssessments(
            @Param("search") String search,
            @Param("status") AssessmentStatus status,
            Pageable pageable);
}
