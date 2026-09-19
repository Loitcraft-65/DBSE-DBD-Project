package com.example.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS rule. The per-controller @CrossOrigin annotations only apply
 * once a controller method actually runs — a 404 (no matching route) or a
 * framework-level error never reaches them, so the browser sees a response
 * with no CORS headers and reports it as a network failure. This config
 * covers every response, including error ones.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    }
}
