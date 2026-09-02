package com.anirban.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;

    private final CustomUserDetailsService
            userDetailsService;

    private final RestAuthenticationEntryPoint
            authenticationEntryPoint;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService,
            RestAuthenticationEntryPoint authenticationEntryPoint) {

        this.jwtService =
                jwtService;

        this.userDetailsService =
                userDetailsService;

        this.authenticationEntryPoint =
                authenticationEntryPoint;
    }

    // =====================================================
    // JWT FILTER
    // =====================================================

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader =
                request.getHeader(
                        "Authorization"
                );

        // =================================================
        // NO AUTHORIZATION HEADER
        //
        // Public endpoints can continue normally.
        // Protected endpoints will later be handled by
        // Spring Security and return 401.
        // =================================================

        if (authHeader == null ||
                authHeader.isBlank()) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        // =================================================
        // NOT A BEARER TOKEN
        // =================================================

        if (!authHeader.startsWith(
                "Bearer ")) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        // =================================================
        // EXTRACT JWT
        // =================================================

        String jwt =
                authHeader
                        .substring(7)
                        .trim();

        // =================================================
        // EMPTY BEARER TOKEN
        // =================================================

        if (jwt.isBlank()) {

            authenticationEntryPoint
                    .commence(
                            request,
                            response,
                            new BadCredentialsException(
                                    "JWT token is missing"
                            )
                    );

            return;
        }

        try {

            // =================================================
            // EXTRACT USERNAME / EMAIL
            // =================================================

            String username =
                    jwtService
                            .extractUsername(
                                    jwt
                            );

            if (username == null ||
                    username.isBlank()) {

                authenticationEntryPoint
                        .commence(
                                request,
                                response,
                                new BadCredentialsException(
                                        "Invalid JWT token"
                                )
                        );

                return;
            }

            // =================================================
            // ONLY AUTHENTICATE IF SECURITY CONTEXT EMPTY
            // =================================================

            if (SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    == null) {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(
                                        username
                                );

                // =============================================
                // VALIDATE JWT
                // =============================================

                if (!jwtService
                        .isTokenValid(
                                jwt,
                                userDetails
                        )) {

                    SecurityContextHolder
                            .clearContext();

                    authenticationEntryPoint
                            .commence(
                                    request,
                                    response,
                                    new BadCredentialsException(
                                            "Invalid JWT token"
                                    )
                            );

                    return;
                }

                // =============================================
                // CREATE AUTHENTICATION
                // =============================================

                UsernamePasswordAuthenticationToken
                        authenticationToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails
                                        .getAuthorities()
                        );

                authenticationToken
                        .setDetails(
                                new WebAuthenticationDetailsSource()
                                        .buildDetails(
                                                request
                                        )
                        );

                // =============================================
                // SAVE AUTHENTICATION
                // =============================================

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(
                                authenticationToken
                        );
            }

            // =================================================
            // CONTINUE FILTER CHAIN
            // =================================================

            filterChain.doFilter(
                    request,
                    response
            );

        } catch (
                ExpiredJwtException exception
        ) {

            // =================================================
            // JWT EXPIRED
            // =================================================

            SecurityContextHolder
                    .clearContext();

            authenticationEntryPoint
                    .commence(
                            request,
                            response,
                            new CredentialsExpiredException(
                                    "JWT token has expired",
                                    exception
                            )
                    );

        } catch (
                JwtException exception
        ) {

            // =================================================
            // MALFORMED / INVALID JWT
            // =================================================

            SecurityContextHolder
                    .clearContext();

            authenticationEntryPoint
                    .commence(
                            request,
                            response,
                            new BadCredentialsException(
                                    "Invalid JWT token",
                                    exception
                            )
                    );

        } catch (
                AuthenticationException exception
        ) {

            // =================================================
            // USER / AUTHENTICATION FAILURE
            // =================================================

            SecurityContextHolder
                    .clearContext();

            authenticationEntryPoint
                    .commence(
                            request,
                            response,
                            exception
                    );

        } catch (
                IllegalArgumentException exception
        ) {

            // =================================================
            // INVALID TOKEN ARGUMENT
            // =================================================

            SecurityContextHolder
                    .clearContext();

            authenticationEntryPoint
                    .commence(
                            request,
                            response,
                            new BadCredentialsException(
                                    "Invalid JWT token",
                                    exception
                            )
                    );
        }
    }
}