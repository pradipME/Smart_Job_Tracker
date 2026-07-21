package com.jobtrack.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class OpenAIConfig {

    private static final Logger log = LoggerFactory.getLogger(OpenAIConfig.class);

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${openai.api.model:gpt-4o-mini}")
    private String model;

    public String getApiKey() { return apiKey; }
    public String getApiUrl() { return apiUrl; }
    public String getModel() { return model; }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.equals("sk-placeholder");
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
