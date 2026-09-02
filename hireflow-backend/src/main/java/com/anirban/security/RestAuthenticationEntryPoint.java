package com.anirban.security;

import com.anirban.exception.ApiErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import org.springframework.stereotype.Component;

import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class RestAuthenticationEntryPoint
        implements AuthenticationEntryPoint {

    private final JsonMapper jsonMapper;

    public RestAuthenticationEntryPoint(
            JsonMapper jsonMapper) {

        this.jsonMapper =
                jsonMapper;
    }

    // =====================================================
    // HANDLE UNAUTHENTICATED REQUEST
    // =====================================================

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException)
            throws IOException {

        // =================================================
        // CLEAR PREVIOUS RESPONSE
        // =================================================

        if (!response.isCommitted()) {

            response.resetBuffer();
        }

        // =================================================
        // HTTP STATUS
        // =================================================

        response.setStatus(
                HttpStatus.UNAUTHORIZED.value()
        );

        response.setContentType(
                "application/json"
        );

        response.setCharacterEncoding(
                "UTF-8"
        );

        // =================================================
        // RESOLVE ERROR MESSAGE
        // =================================================

        String message =
                resolveMessage(
                        authException
                );

        // =================================================
        // CREATE STANDARD ERROR RESPONSE
        // =================================================

        ApiErrorResponse errorResponse =
                new ApiErrorResponse(
                        LocalDateTime.now(),
                        HttpStatus.UNAUTHORIZED.value(),
                        HttpStatus.UNAUTHORIZED
                                .getReasonPhrase(),
                        message,
                        request.getRequestURI()
                );

        // =================================================
        // CONVERT JAVA OBJECT -> JSON
        // =================================================

        jsonMapper.writeValue(
                response.getOutputStream(),
                errorResponse
        );

        response.flushBuffer();
    }

    // =====================================================
    // RESOLVE AUTH MESSAGE
    // =====================================================

    private String resolveMessage(
            AuthenticationException exception) {

        if (exception instanceof
                CredentialsExpiredException) {

            return "Your session has expired. Please sign in again.";
        }

        if (exception instanceof
                BadCredentialsException) {

            return "Invalid authentication token";
        }

        return "Authentication is required to access this resource";
    }
}