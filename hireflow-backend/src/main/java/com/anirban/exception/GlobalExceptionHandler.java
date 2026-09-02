package com.anirban.exception;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;

import org.springframework.validation.FieldError;

import org.springframework.web.HttpRequestMethodNotSupportedException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;


@RestControllerAdvice
public class GlobalExceptionHandler {


    // =====================================================
    // VALIDATION ERRORS
    // =====================================================

    @ExceptionHandler(
            MethodArgumentNotValidException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleValidationException(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {

        Map<String, String> errors =
                new LinkedHashMap<>();


        for (
                FieldError fieldError :
                exception
                        .getBindingResult()
                        .getFieldErrors()
        ) {

            errors.put(
                    fieldError.getField(),
                    fieldError.getDefaultMessage()
            );
        }


        ApiErrorResponse response =
                new ApiErrorResponse(

                        LocalDateTime.now(),

                        HttpStatus.BAD_REQUEST
                                .value(),

                        HttpStatus.BAD_REQUEST
                                .getReasonPhrase(),

                        "Validation failed",

                        request
                                .getRequestURI(),

                        errors
                );


        return ResponseEntity
                .status(
                        HttpStatus.BAD_REQUEST
                )
                .body(
                        response
                );
    }


    // =====================================================
    // MISSING REQUEST PARAMETER
    // =====================================================

    @ExceptionHandler(
            MissingServletRequestParameterException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleMissingParameter(
            MissingServletRequestParameterException exception,
            HttpServletRequest request) {

        String message =
                "Required parameter '"
                        + exception
                                .getParameterName()
                        + "' is missing";


        return buildResponse(
                HttpStatus.BAD_REQUEST,
                message,
                request
        );
    }


    // =====================================================
    // INVALID ENUM / PATH VARIABLE / PARAMETER TYPE
    // =====================================================

    @ExceptionHandler(
            MethodArgumentTypeMismatchException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleTypeMismatch(
            MethodArgumentTypeMismatchException exception,
            HttpServletRequest request) {

        String message =
                "Invalid value for parameter '"
                        + exception.getName()
                        + "'";


        return buildResponse(
                HttpStatus.BAD_REQUEST,
                message,
                request
        );
    }


    // =====================================================
    // INVALID JSON REQUEST
    // =====================================================

    @ExceptionHandler(
            HttpMessageNotReadableException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleInvalidJson(
            HttpMessageNotReadableException exception,
            HttpServletRequest request) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Invalid request body",
                request
        );
    }


    // =====================================================
    // BAD LOGIN
    // =====================================================

    @ExceptionHandler(
            BadCredentialsException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleBadCredentials(
            BadCredentialsException exception,
            HttpServletRequest request) {

        return buildResponse(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password",
                request
        );
    }


    // =====================================================
    // AUTHENTICATION ERROR
    // =====================================================

    @ExceptionHandler(
            AuthenticationException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleAuthenticationException(
            AuthenticationException exception,
            HttpServletRequest request) {

        return buildResponse(
                HttpStatus.UNAUTHORIZED,
                "Authentication required",
                request
        );
    }


    // =====================================================
    // ACCESS DENIED
    // =====================================================

    @ExceptionHandler(
            AccessDeniedException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleAccessDeniedException(
            AccessDeniedException exception,
            HttpServletRequest request) {

        return buildResponse(
                HttpStatus.FORBIDDEN,
                "You do not have permission to perform this action",
                request
        );
    }


    // =====================================================
    // ENDPOINT / STATIC RESOURCE NOT FOUND
    // =====================================================

    @ExceptionHandler(
            NoResourceFoundException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleNoResourceFoundException(
            NoResourceFoundException exception,
            HttpServletRequest request) {

        return buildResponse(
                HttpStatus.NOT_FOUND,
                "Endpoint not found",
                request
        );
    }


    // =====================================================
    // HTTP METHOD NOT ALLOWED
    //
    // Example:
    //
    // Endpoint supports:
    //
    // GET /api/jobs
    //
    // but frontend accidentally sends POST.
    //
    // Response:
    //
    // 405 Method Not Allowed
    // =====================================================

    @ExceptionHandler(
            HttpRequestMethodNotSupportedException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleMethodNotSupported(
            HttpRequestMethodNotSupportedException exception,
            HttpServletRequest request) {

        String method =
                exception
                        .getMethod();


        String message =
                "HTTP method "
                        + method
                        + " is not supported for this endpoint";


        return buildResponse(
                HttpStatus.METHOD_NOT_ALLOWED,
                message,
                request
        );
    }


    // =====================================================
    // BUSINESS RuntimeException
    // =====================================================

    @ExceptionHandler(
            RuntimeException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleRuntimeException(
            RuntimeException exception,
            HttpServletRequest request) {

        String message =
                exception
                        .getMessage();


        if (
                message == null ||
                message.isBlank()
        ) {

            message =
                    "Unable to process request";
        }


        HttpStatus status =
                determineStatus(
                        message
                );


        return buildResponse(
                status,
                message,
                request
        );
    }


    // =====================================================
    // UNEXPECTED SERVER ERROR
    // =====================================================

    @ExceptionHandler(
            Exception.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleUnexpectedException(
            Exception exception,
            HttpServletRequest request) {

        // =============================================
        // Keep detailed error only in backend console.
        // Do not expose stack trace to frontend.
        // =============================================

        exception
                .printStackTrace();


        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected server error occurred",
                request
        );
    }


    // =====================================================
    // DETERMINE BUSINESS ERROR STATUS
    // =====================================================

    private HttpStatus determineStatus(
            String message) {

        String normalized =
                message
                        .toLowerCase(
                                Locale.ROOT
                        );


        // =================================================
        // 404 - NOT FOUND
        // =================================================

        if (
                normalized.contains(
                        "not found"
                )
                ||
                normalized.contains(
                        "does not exist"
                )
        ) {

            return (
                    HttpStatus.NOT_FOUND
            );
        }


        // =================================================
        // 409 - CONFLICT
        // =================================================

        if (
                normalized.contains(
                        "already exists"
                )
                ||
                normalized.contains(
                        "already applied"
                )
                ||
                normalized.contains(
                        "already saved"
                )
                ||
                normalized.contains(
                        "already withdrawn"
                )
                ||
                normalized.contains(
                        "already closed"
                )
                ||
                normalized.contains(
                        "already has this status"
                )
                ||
                normalized.contains(
                        "duplicate"
                )
        ) {

            return (
                    HttpStatus.CONFLICT
            );
        }


        // =================================================
        // 403 - FORBIDDEN
        // =================================================

        if (
                normalized.contains(
                        "not authorized"
                )
                ||
                normalized.contains(
                        "access denied"
                )
                ||
                normalized.contains(
                        "permission"
                )
                ||
                normalized.contains(
                        "only recruiters"
                )
                ||
                normalized.contains(
                        "only candidates"
                )
        ) {

            return (
                    HttpStatus.FORBIDDEN
            );
        }


        // =================================================
        // 400 - BAD REQUEST
        // =================================================

        if (
                normalized.contains(
                        "required"
                )
                ||
                normalized.contains(
                        "cannot be"
                )
                ||
                normalized.contains(
                        "cannot exceed"
                )
                ||
                normalized.contains(
                        "invalid"
                )
                ||
                normalized.contains(
                        "must be"
                )
                ||
                normalized.contains(
                        "not open"
                )
                ||
                normalized.contains(
                        "no longer available"
                )
        ) {

            return (
                    HttpStatus.BAD_REQUEST
            );
        }


        // =================================================
        // DEFAULT BUSINESS ERROR
        // =================================================

        return (
                HttpStatus.BAD_REQUEST
        );
    }


    // =====================================================
    // BUILD STANDARD ERROR RESPONSE
    // =====================================================

    private ResponseEntity<ApiErrorResponse>
    buildResponse(
            HttpStatus status,
            String message,
            HttpServletRequest request) {

        ApiErrorResponse response =
                new ApiErrorResponse(

                        LocalDateTime.now(),

                        status.value(),

                        status.getReasonPhrase(),

                        message,

                        request
                                .getRequestURI()
                );


        return ResponseEntity
                .status(
                        status
                )
                .body(
                        response
                );
    }
}