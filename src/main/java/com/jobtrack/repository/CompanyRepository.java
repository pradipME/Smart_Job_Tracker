package com.jobtrack.repository;

import com.jobtrack.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    List<Company> findByDeletedFalse();

    Page<Company> findByDeletedFalse(Pageable pageable);

    Optional<Company> findByIdAndDeletedFalse(Long id);

    List<Company> findByNameContainingIgnoreCaseAndDeletedFalse(String name);

    Page<Company> findByNameContainingIgnoreCaseAndDeletedFalse(String name, Pageable pageable);

    boolean existsByNameAndDeletedFalse(String name);
}
