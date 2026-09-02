package com.anirban.security;

import com.anirban.exception.ApiErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

import org.springframework.stereotype.Component;

import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class RestAccessDeniedHandler
        implements AccessDeniedHandler {

    private final JsonMapper jsonMapper;

    public RestAccessDeniedHandler(
            JsonMapper jsonMapper) {

        this.jsonMapper =
                jsonMapper;
    }

    // =====================================================
    // HANDLE FORBIDDEN REQUEST
    // =====================================================

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException)
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
                HttpStatus.FORBIDDEN.value()
        );

        response.setContentType(
                "application/json"
        );

        response.setCharacterEncoding(
                "UTF-8"
        );

        // =================================================
        // CREATE STANDARD ERROR RESPONSE
        // =================================================

        ApiErrorResponse errorResponse =
                new ApiErrorResponse(
                        LocalDateTime.now(),
                        HttpStatus.FORBIDDEN.value(),
                        HttpStatus.FORBIDDEN
                                .getReasonPhrase(),
                        "You do not have permission to access this resource",
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
}