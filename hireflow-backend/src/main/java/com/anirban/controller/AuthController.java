package com.anirban.controller;

import com.anirban.dto.AuthResponse;
import com.anirban.dto.LoginRequest;
import com.anirban.dto.RegisterRequest;
import com.anirban.entity.User;
import com.anirban.security.JwtService;
import com.anirban.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    public AuthController(
            UserService userService,
            AuthenticationManager authenticationManager,
            UserDetailsService userDetailsService,
            JwtService jwtService) {

        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    // =========================
    // REGISTER
    // =========================

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request) {

        if (userService.existsByEmail(request.getEmail())) {

            AuthResponse response = new AuthResponse(
                    null,
                    null,
                    null,
                    request.getEmail(),
                    null,
                    "Email already registered"
            );

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(response);
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());

        User savedUser = userService.createUser(user);

        AuthResponse response = new AuthResponse(
                null,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                "Registration successful"
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        try {

            // Authenticate email + password
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            // Load authenticated user
            User user =
                    userService.getUserByEmail(
                            request.getEmail()
                    );

            // Load Spring Security UserDetails
            UserDetails userDetails =
                    userDetailsService.loadUserByUsername(
                            request.getEmail()
                    );

            // Generate JWT
            String token =
                    jwtService.generateToken(userDetails);

            AuthResponse response = new AuthResponse(
                    token,
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole().name(),
                    "Login successful"
            );

            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
    }
}