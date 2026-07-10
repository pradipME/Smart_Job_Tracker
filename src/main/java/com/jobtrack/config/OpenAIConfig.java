package com.jobtrack.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class OpenAIConfig {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${openai.api.model:gpt-4o-mini}")
    private String model;

    public String getApiKey() { return apiKey; }
    public String getApiUrl() { return apiUrl; }
    public String getModel() { return model; }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
