package com.anirban.service;

import com.anirban.dto.RecruiterProfileRequest;
import com.anirban.dto.RecruiterProfileResponse;

import com.anirban.entity.RecruiterProfile;
import com.anirban.entity.Role;
import com.anirban.entity.User;

import com.anirban.repository.RecruiterProfileRepository;
import com.anirban.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecruiterProfileServiceImpl
        implements RecruiterProfileService {

    private final RecruiterProfileRepository
            profileRepository;

    private final UserRepository
            userRepository;

    public RecruiterProfileServiceImpl(
            RecruiterProfileRepository profileRepository,
            UserRepository userRepository) {

        this.profileRepository =
                profileRepository;

        this.userRepository =
                userRepository;
    }

    // =====================================================
    // CREATE PROFILE
    // =====================================================

    @Override
    @Transactional
    public RecruiterProfileResponse createProfile(
            Long userId,
            RecruiterProfileRequest request) {

        // =================================================
        // VALIDATE RECRUITER
        // =================================================

        User user =
                getRecruiterUser(
                        userId
                );

        // =================================================
        // VALIDATE REQUEST
        // =================================================

        validateRequest(
                request
        );

        // =================================================
        // PREVENT DUPLICATE PROFILE
        // =================================================

        if (profileRepository
                .existsByUserId(
                        userId
                )) {

            throw new RuntimeException(
                    "Recruiter profile already exists"
            );
        }

        // =================================================
        // CREATE PROFILE
        // =================================================

        RecruiterProfile profile =
                new RecruiterProfile();

        profile.setUser(
                user
        );

        profile.setCompanyName(
                request
                        .getCompanyName()
                        .trim()
        );

        profile.setCompanyDescription(
                normalizeOptionalText(
                        request.getCompanyDescription()
                )
        );

        profile.setWebsite(
                normalizeOptionalText(
                        request.getWebsite()
                )
        );

        // =================================================
        // SAVE
        // =================================================

        RecruiterProfile saved =
                profileRepository.save(
                        profile
                );

        return convertToResponse(
                saved
        );
    }

    // =====================================================
    // GET PROFILE
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public RecruiterProfileResponse getProfile(
            Long userId) {

        // =================================================
        // VALIDATE RECRUITER
        // =================================================

        getRecruiterUser(
                userId
        );

        // =================================================
        // FIND PROFILE
        // =================================================

        RecruiterProfile profile =
                profileRepository
                        .findByUserId(
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Recruiter profile not found"
                                        )
                        );

        return convertToResponse(
                profile
        );
    }

    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    @Override
    @Transactional
    public RecruiterProfileResponse updateProfile(
            Long userId,
            RecruiterProfileRequest request) {

        // =================================================
        // VALIDATE RECRUITER
        // =================================================

        getRecruiterUser(
                userId
        );

        // =================================================
        // VALIDATE REQUEST
        // =================================================

        validateRequest(
                request
        );

        // =================================================
        // FIND PROFILE
        // =================================================

        RecruiterProfile profile =
                profileRepository
                        .findByUserId(
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Recruiter profile not found"
                                        )
                        );

        // =================================================
        // UPDATE PROFILE
        // =================================================

        profile.setCompanyName(
                request
                        .getCompanyName()
                        .trim()
        );

        profile.setCompanyDescription(
                normalizeOptionalText(
                        request.getCompanyDescription()
                )
        );

        profile.setWebsite(
                normalizeOptionalText(
                        request.getWebsite()
                )
        );

        // =================================================
        // SAVE
        // =================================================

        RecruiterProfile updated =
                profileRepository.save(
                        profile
                );

        return convertToResponse(
                updated
        );
    }

    // =====================================================
    // VALIDATE REQUEST
    // =====================================================

    private void validateRequest(
            RecruiterProfileRequest request) {

        if (request == null) {

            throw new RuntimeException(
                    "Recruiter profile request is required"
            );
        }

        if (request.getCompanyName() == null ||
                request
                        .getCompanyName()
                        .isBlank()) {

            throw new RuntimeException(
                    "Company name is required"
            );
        }
    }

    // =====================================================
    // VALIDATE RECRUITER USER
    // =====================================================

    private User getRecruiterUser(
            Long userId) {

        if (userId == null) {

            throw new RuntimeException(
                    "Recruiter ID is required"
            );
        }

        User user =
                userRepository
                        .findById(
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Recruiter not found"
                                        )
                        );

        if (user.getRole() !=
                Role.RECRUITER) {

            throw new RuntimeException(
                    "Only recruiters can access recruiter profile"
            );
        }

        return user;
    }

    // =====================================================
    // NORMALIZE OPTIONAL TEXT
    // =====================================================

    private String normalizeOptionalText(
            String value) {

        if (value == null ||
                value.isBlank()) {

            return null;
        }

        return value.trim();
    }

    // =====================================================
    // ENTITY -> RESPONSE
    // =====================================================

    private RecruiterProfileResponse
    convertToResponse(
            RecruiterProfile profile) {

        if (profile == null) {

            throw new RuntimeException(
                    "Recruiter profile cannot be null"
            );
        }

        User user =
                profile.getUser();

        if (user == null) {

            throw new RuntimeException(
                    "Recruiter profile user information is missing"
            );
        }

        return new RecruiterProfileResponse(
                profile.getId(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                profile.getCompanyName(),
                profile.getCompanyDescription(),
                profile.getWebsite()
        );
    }
}