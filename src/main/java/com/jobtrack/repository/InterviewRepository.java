package com.jobtrack.repository;

import com.jobtrack.entity.Interview;
import com.jobtrack.entity.InterviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    @Query("SELECT i FROM Interview i WHERE i.application.id = :applicationId " +
           "AND i.status = 'SCHEDULED' " +
           "AND i.date = :date " +
           "AND (:excludeId IS NULL OR i.id <> :excludeId) " +
           "AND ((i.startTime < :endTime AND i.endTime > :startTime))")
    List<Interview> findOverlapping(
            @Param("applicationId") Long applicationId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId);

    @Query("SELECT i FROM Interview i WHERE i.date = :date ORDER BY i.startTime ASC")
    List<Interview> findByDate(@Param("date") LocalDate date);

    @Query("SELECT i FROM Interview i WHERE i.date BETWEEN :start AND :end ORDER BY i.date ASC, i.startTime ASC")
    List<Interview> findByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT i FROM Interview i WHERE i.application.candidate.id = :candidateId ORDER BY i.date DESC, i.startTime DESC")
    List<Interview> findByCandidateId(@Param("candidateId") Long candidateId);

    @Query("SELECT i FROM Interview i WHERE i.application.candidate.id = :candidateId AND i.id = :id")
    Optional<Interview> findByIdAndCandidateId(@Param("id") Long id, @Param("candidateId") Long candidateId);

    @Query("SELECT i FROM Interview i WHERE i.status = :status ORDER BY i.date DESC")
    List<Interview> findByStatus(@Param("status") InterviewStatus status);

    @Query("SELECT COUNT(i) FROM Interview i WHERE i.date = :date AND i.status = 'SCHEDULED'")
    long countScheduledOnDate(@Param("date") LocalDate date);

    @Query("SELECT i FROM Interview i JOIN FETCH i.application a JOIN FETCH a.candidate JOIN FETCH a.job j JOIN FETCH j.company " +
           "WHERE (:search IS NULL OR LOWER(a.candidate.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(a.job.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(i.interviewerName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:mode IS NULL OR i.mode = :mode) " +
           "ORDER BY i.date DESC, i.startTime DESC")
    Page<Interview> searchInterviews(
            @Param("search") String search,
            @Param("status") InterviewStatus status,
            @Param("mode") com.jobtrack.entity.InterviewMode mode,
            Pageable pageable);

    List<Interview> findByApplicationId(Long applicationId);
}
