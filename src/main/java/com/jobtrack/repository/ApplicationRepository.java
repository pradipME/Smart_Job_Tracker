package com.jobtrack.repository;

import com.jobtrack.entity.Application;
import com.jobtrack.entity.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByCandidateIdAndDeletedFalse(Long candidateId);

    Optional<Application> findByCandidateIdAndDeletedFalseAndId(Long candidateId, Long id);

    Optional<Application> findByCandidateIdAndJobIdAndDeletedFalse(Long candidateId, Long jobId);

    boolean existsByCandidateIdAndJobIdAndDeletedFalse(Long candidateId, Long jobId);

    Optional<Application> findByIdAndDeletedFalse(Long id);

    Page<Application> findByCandidateIdAndDeletedFalse(Long candidateId, Pageable pageable);

    long countByDeletedFalse();

    @Query("SELECT a FROM Application a JOIN a.candidate c JOIN a.job j JOIN j.company co WHERE a.deleted = false AND " +
           "(:search IS NULL OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(co.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:companyId IS NULL OR co.id = :companyId) AND " +
           "(:jobId IS NULL OR j.id = :jobId)")
    Page<Application> findAdminApplications(
            @Param("search") String search,
            @Param("status") ApplicationStatus status,
            @Param("companyId") Long companyId,
            @Param("jobId") Long jobId,
            Pageable pageable);

    long countByDeletedFalseAndAppliedAtAfter(LocalDateTime dateTime);

    long countByDeletedFalseAndStatus(ApplicationStatus status);

    @Query("SELECT a.status, COUNT(a) FROM Application a WHERE a.deleted = false GROUP BY a.status")
    List<Object[]> countByStatusGroup();

    @Query("SELECT co.name, COUNT(a) FROM Application a JOIN a.job j JOIN j.company co WHERE a.deleted = false GROUP BY co.name ORDER BY COUNT(a) DESC")
    List<Object[]> countByCompanyGroup();

    @Query("SELECT FUNCTION('YEAR', a.appliedAt), FUNCTION('MONTH', a.appliedAt), COUNT(a) FROM Application a WHERE a.deleted = false GROUP BY FUNCTION('YEAR', a.appliedAt), FUNCTION('MONTH', a.appliedAt) ORDER BY FUNCTION('YEAR', a.appliedAt) ASC, FUNCTION('MONTH', a.appliedAt) ASC")
    List<Object[]> countMonthly();
}
