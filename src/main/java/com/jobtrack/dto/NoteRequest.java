package com.jobtrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class NoteRequest {

    @NotBlank
    @Size(max = 2000)
    private String content;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
