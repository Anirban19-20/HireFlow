package com.anirban.service;

import com.anirban.dto.CandidateProfileRequest;
import com.anirban.dto.CandidateProfileResponse;

import com.anirban.entity.CandidateProfile;
import com.anirban.entity.Role;
import com.anirban.entity.User;

import com.anirban.repository.CandidateProfileRepository;
import com.anirban.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;

@Service
public class CandidateProfileServiceImpl
        implements CandidateProfileService {

    private final CandidateProfileRepository profileRepository;

    private final UserRepository userRepository;

    private final SupabaseStorageService supabaseStorageService;


    public CandidateProfileServiceImpl(
            CandidateProfileRepository profileRepository,
            UserRepository userRepository,
            SupabaseStorageService supabaseStorageService) {

        this.profileRepository =
                profileRepository;

        this.userRepository =
                userRepository;

        this.supabaseStorageService =
                supabaseStorageService;
    }


    // =====================================================
    // CREATE PROFILE
    // =====================================================

    @Override
    @Transactional
    public CandidateProfileResponse createProfile(
            Long userId,
            CandidateProfileRequest request) {

        if (
                request == null
        ) {

            throw new RuntimeException(
                    "Candidate profile request is required"
            );
        }


        User user =
                getCandidateUser(
                        userId
                );


        if (
                profileRepository
                        .existsByUserId(
                                userId
                        )
        ) {

            throw new RuntimeException(
                    "Candidate profile already exists"
            );
        }


        CandidateProfile profile =
                new CandidateProfile();


        profile.setUser(
                user
        );


        profile.setPhone(
                cleanText(
                        request.getPhone()
                )
        );


        profile.setLocation(
                cleanText(
                        request.getLocation()
                )
        );


        profile.setSkills(
                cleanText(
                        request.getSkills()
                )
        );


        profile.setExperience(
                request.getExperience()
        );


        profile.setEducation(
                cleanText(
                        request.getEducation()
                )
        );


        // Resume should normally be uploaded
        // through /api/candidate/profile/resume.
        // This keeps compatibility if resumeUrl
        // is provided during profile creation.

        profile.setResumeUrl(
                cleanText(
                        request.getResumeUrl()
                )
        );


        CandidateProfile saved =
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
    public CandidateProfileResponse getProfile(
            Long userId) {

        getCandidateUser(
                userId
        );


        CandidateProfile profile =
                profileRepository
                        .findByUserId(
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Candidate profile not found"
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
    public CandidateProfileResponse updateProfile(
            Long userId,
            CandidateProfileRequest request) {

        if (
                request == null
        ) {

            throw new RuntimeException(
                    "Candidate profile request is required"
            );
        }


        getCandidateUser(
                userId
        );


        CandidateProfile profile =
                profileRepository
                        .findByUserId(
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Candidate profile not found"
                                        )
                        );


        profile.setPhone(
                cleanText(
                        request.getPhone()
                )
        );


        profile.setLocation(
                cleanText(
                        request.getLocation()
                )
        );


        profile.setSkills(
                cleanText(
                        request.getSkills()
                )
        );


        profile.setExperience(
                request.getExperience()
        );


        profile.setEducation(
                cleanText(
                        request.getEducation()
                )
        );


        // =================================================
        // IMPORTANT:
        // Do NOT set resumeUrl from the normal profile form.
        //
        // Previously:
        //
        // profile.setResumeUrl(request.getResumeUrl());
        //
        // If frontend sent resumeUrl = null, the existing
        // uploaded resume could be lost from the database.
        //
        // Resume is managed only through:
        //
        // POST   /api/candidate/profile/resume
        // DELETE /api/candidate/profile/resume
        // =================================================


        CandidateProfile updated =
                profileRepository.save(
                        profile
                );


        return convertToResponse(
                updated
        );
    }


    // =====================================================
    // UPLOAD / REPLACE RESUME
    // =====================================================

    @Override
    @Transactional
    public CandidateProfileResponse uploadResume(
            Long userId,
            MultipartFile file) {

        getCandidateUser(
                userId
        );


        if (
                file == null ||
                file.isEmpty()
        ) {

            throw new RuntimeException(
                    "Resume file is required"
            );
        }


        CandidateProfile profile =
                profileRepository
                        .findByUserId(
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Candidate profile not found"
                                        )
                        );


        String oldResumeUrl =
                profile.getResumeUrl();


        try {

            // =============================================
            // 1. UPLOAD NEW RESUME FIRST
            // =============================================

            String newResumeUrl =
                    supabaseStorageService
                            .uploadResume(
                                    userId,
                                    file
                            );


            if (
                    newResumeUrl == null ||
                    newResumeUrl.isBlank()
            ) {

                throw new RuntimeException(
                        "Resume storage returned an empty URL"
                );
            }


            // =============================================
            // 2. UPDATE DATABASE
            // =============================================

            profile.setResumeUrl(
                    newResumeUrl
            );


            CandidateProfile saved =
                    profileRepository.save(
                            profile
                    );


            // =============================================
            // 3. DELETE OLD RESUME
            //
            // Only do this after:
            // - new upload succeeded
            // - database update succeeded
            // =============================================

            if (
                    oldResumeUrl != null &&
                    !oldResumeUrl.isBlank() &&
                    !oldResumeUrl.equals(
                            newResumeUrl
                    )
            ) {

                try {

                    supabaseStorageService
                            .deleteResume(
                                    oldResumeUrl
                            );

                } catch (
                        Exception deleteException
                ) {

                    System.out.println(
                            "Old resume could not be deleted: "
                                    +
                                    deleteException
                                            .getMessage()
                    );
                }
            }


            return convertToResponse(
                    saved
            );

        } catch (
                RuntimeException exception
        ) {

            throw exception;

        } catch (
                Exception exception
        ) {

            throw new RuntimeException(
                    "Failed to upload resume: "
                            +
                            exception.getMessage(),
                    exception
            );
        }
    }


    // =====================================================
    // DELETE RESUME
    // =====================================================

    @Override
    @Transactional
    public CandidateProfileResponse deleteResume(
            Long userId) {

        getCandidateUser(
                userId
        );


        CandidateProfile profile =
                profileRepository
                        .findByUserId(
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Candidate profile not found"
                                        )
                        );


        String resumeUrl =
                profile.getResumeUrl();


        if (
                resumeUrl == null ||
                resumeUrl.isBlank()
        ) {

            throw new RuntimeException(
                    "No resume found"
            );
        }


        // =============================================
        // DELETE FROM SUPABASE
        // =============================================

        try {

            supabaseStorageService
                    .deleteResume(
                            resumeUrl
                    );

        } catch (
                Exception exception
        ) {

            throw new RuntimeException(
                    "Failed to delete resume: "
                            +
                            exception.getMessage(),
                    exception
            );
        }


        // =============================================
        // REMOVE URL FROM DATABASE
        // =============================================

        profile.setResumeUrl(
                null
        );


        CandidateProfile saved =
                profileRepository.save(
                        profile
                );


        return convertToResponse(
                saved
        );
    }


    // =====================================================
    // GET + VALIDATE CANDIDATE USER
    // =====================================================

    private User getCandidateUser(
            Long userId) {

        if (
                userId == null
        ) {

            throw new RuntimeException(
                    "User ID is required"
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
                                                "User not found with ID: "
                                                        +
                                                        userId
                                        )
                        );


        if (
                user.getRole() !=
                Role.CANDIDATE
        ) {

            throw new RuntimeException(
                    "Only candidates can access candidate profile"
            );
        }


        return user;
    }


    // =====================================================
    // CLEAN TEXT
    // =====================================================

    private String cleanText(
            String value) {

        if (
                value == null
        ) {

            return null;
        }


        String cleaned =
                value.trim();


        return cleaned.isEmpty()
                ? null
                : cleaned;
    }


    // =====================================================
    // CONVERT ENTITY -> RESPONSE
    // =====================================================

    private CandidateProfileResponse convertToResponse(
            CandidateProfile profile) {

        if (
                profile == null
        ) {

            throw new RuntimeException(
                    "Candidate profile is required"
            );
        }


        User user =
                profile.getUser();


        if (
                user == null
        ) {

            throw new RuntimeException(
                    "Candidate profile user is missing"
            );
        }


        return new CandidateProfileResponse(

                profile.getId(),

                user.getId(),

                user.getName(),

                user.getEmail(),

                profile.getPhone(),

                profile.getLocation(),

                profile.getSkills(),

                profile.getExperience(),

                profile.getEducation(),

                profile.getResumeUrl()
        );
    }
}