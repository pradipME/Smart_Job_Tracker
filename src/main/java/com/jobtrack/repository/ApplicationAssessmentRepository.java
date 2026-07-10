package com.jobtrack.repository;

import com.jobtrack.entity.ApplicationAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApplicationAssessmentRepository extends JpaRepository<ApplicationAssessment, Long> {

    @Query("SELECT aa FROM ApplicationAssessment aa WHERE aa.applicationId = :applicationId AND aa.deleted = false")
    Optional<ApplicationAssessment> findByApplicationId(@Param("applicationId") Long applicationId);

    Optional<ApplicationAssessment> findByIdAndDeletedFalse(Long id);

    @Query("SELECT aa FROM ApplicationAssessment aa WHERE aa.candidateId = :candidateId AND aa.deleted = false ORDER BY aa.id DESC")
    List<ApplicationAssessment> findByCandidateId(@Param("candidateId") Long candidateId);

    @Query("SELECT aa FROM ApplicationAssessment aa WHERE aa.assessment.id = :assessmentId AND aa.deleted = false")
    List<ApplicationAssessment> findByAssessmentId(@Param("assessmentId") Long assessmentId);

    boolean existsByApplicationIdAndDeletedFalse(Long applicationId);
}
