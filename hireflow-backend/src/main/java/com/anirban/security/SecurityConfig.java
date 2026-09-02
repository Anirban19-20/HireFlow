package com.anirban.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter
            jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // =============================================
                // CORS
                // =============================================

                .cors(
                        cors ->
                                cors.configurationSource(
                                        corsConfigurationSource()
                                )
                )


                // =============================================
                // CSRF
                // =============================================

                .csrf(
                        csrf ->
                                csrf.disable()
                )


                // =============================================
                // SESSION
                // =============================================

                .sessionManagement(
                        session ->
                                session.sessionCreationPolicy(
                                        SessionCreationPolicy.STATELESS
                                )
                )


                // =============================================
                // AUTHORIZATION
                // =============================================

                .authorizeHttpRequests(
                        auth -> auth

                                // PUBLIC AUTH

                                .requestMatchers(
                                        "/api/auth/**"
                                )
                                .permitAll()


                                // PUBLIC JOB ENDPOINTS

                                .requestMatchers(
                                        "/api/jobs/**"
                                )
                                .permitAll()


                                // ADMIN ENDPOINTS

                                .requestMatchers(
                                        "/api/admin/**"
                                )
                                .hasRole(
                                        "ADMIN"
                                )


                                // CANDIDATE PROFILE

                                .requestMatchers(
                                        "/api/candidates/**"
                                )
                                .hasRole(
                                        "CANDIDATE"
                                )


                                // CANDIDATE ENDPOINTS

                                .requestMatchers(
                                        "/api/candidate/**"
                                )
                                .hasRole(
                                        "CANDIDATE"
                                )


                                // RECRUITER ENDPOINTS

                                .requestMatchers(
                                        "/api/recruiter/**"
                                )
                                .hasRole(
                                        "RECRUITER"
                                )


                                // SHARED APPLICATION HISTORY

                                .requestMatchers(
                                        "/api/applications/**"
                                )
                                .hasAnyRole(
                                        "CANDIDATE",
                                        "RECRUITER"
                                )


                                // NOTIFICATIONS

                                .requestMatchers(
                                        "/api/notifications/**"
                                )
                                .authenticated()


                                // EVERYTHING ELSE

                                .anyRequest()
                                .authenticated()
                )


                // =============================================
                // JWT FILTER
                // =============================================

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }


    // =====================================================
    // PASSWORD ENCODER
    // =====================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    // =====================================================
    // AUTHENTICATION MANAGER
    // =====================================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration
                .getAuthenticationManager();
    }


    // =====================================================
    // CORS CONFIGURATION
    // =====================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:3000"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept"
                )
        );

        configuration.setExposedHeaders(
                List.of(
                        "Authorization"
                )
        );

        configuration.setAllowCredentials(
                true
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}