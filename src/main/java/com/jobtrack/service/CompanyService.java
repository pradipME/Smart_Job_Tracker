package com.jobtrack.service;

import com.jobtrack.dto.CompanyRequest;
import com.jobtrack.dto.CompanyResponse;
import com.jobtrack.entity.Company;
import com.jobtrack.repository.CompanyRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public CompanyResponse create(CompanyRequest request) {
        if (companyRepository.existsByNameAndDeletedFalse(request.getName())) {
            throw new IllegalArgumentException("A company with this name already exists");
        }

        Company company = new Company();
        mapRequestToEntity(request, company);

        return CompanyResponse.fromEntity(companyRepository.save(company));
    }

    public CompanyResponse getById(Long id) {
        Company company = companyRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        return CompanyResponse.fromEntity(company);
    }

    public List<CompanyResponse> getAll() {
        return companyRepository.findByDeletedFalse()
                .stream()
                .map(CompanyResponse::fromEntity)
                .toList();
    }

    public Page<CompanyResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return companyRepository.findByDeletedFalse(pageable)
                .map(CompanyResponse::fromEntity);
    }

    public List<CompanyResponse> search(String name) {
        return companyRepository.findByNameContainingIgnoreCaseAndDeletedFalse(name)
                .stream()
                .map(CompanyResponse::fromEntity)
                .toList();
    }

    public Page<CompanyResponse> searchPaginated(String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return companyRepository.findByNameContainingIgnoreCaseAndDeletedFalse(name, pageable)
                .map(CompanyResponse::fromEntity);
    }

    public CompanyResponse update(Long id, CompanyRequest request) {
        Company company = companyRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        if (!company.getName().equalsIgnoreCase(request.getName())
                && companyRepository.existsByNameAndDeletedFalse(request.getName())) {
            throw new IllegalArgumentException("A company with this name already exists");
        }

        mapRequestToEntity(request, company);

        return CompanyResponse.fromEntity(companyRepository.save(company));
    }

    public void delete(Long id) {
        Company company = companyRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        company.setDeleted(true);
        companyRepository.save(company);
    }

    private void mapRequestToEntity(CompanyRequest request, Company company) {
        company.setName(request.getName());
        company.setLogoUrl(request.getLogoUrl());
        company.setWebsite(request.getWebsite());
        company.setIndustry(request.getIndustry());
        company.setLocation(request.getLocation());
        company.setCompanySize(request.getCompanySize());
        company.setDescription(request.getDescription());
    }
}
