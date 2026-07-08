package com.jobtrack.service;

import com.jobtrack.dto.ResumeResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class ResumeService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ResumeResponse uploadResume(MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            throw new RuntimeException("Please select a file");
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        Files.createDirectories(uploadPath);

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        Path targetPath = uploadPath.resolve(fileName);

        file.transferTo(targetPath);

        return new ResumeResponse(
                fileName,
                "Resume uploaded successfully"
        );
    }
}