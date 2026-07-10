package com.jobtrack.controller;

import com.jobtrack.dto.CompanyRequest;
import com.jobtrack.dto.CompanyResponse;
import com.jobtrack.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String name) {

        if (name != null && !name.isBlank()) {
            Page<CompanyResponse> result = companyService.searchPaginated(name, page, size);
            return ResponseEntity.ok(result);
        }

        Page<CompanyResponse> result = companyService.getAllPaginated(page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/all")
    public ResponseEntity<List<CompanyResponse>> getAllUnpaginated() {
        return ResponseEntity.ok(companyService.getAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<CompanyResponse>> search(@RequestParam String name) {
        return ResponseEntity.ok(companyService.search(name));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyResponse> create(@Valid @RequestBody CompanyRequest request) {
        CompanyResponse response = companyService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CompanyRequest request) {
        return ResponseEntity.ok(companyService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        companyService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Company deleted successfully"));
    }
}
