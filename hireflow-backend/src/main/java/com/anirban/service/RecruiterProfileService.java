package com.anirban.service;

import com.anirban.dto.RecruiterProfileRequest;
import com.anirban.dto.RecruiterProfileResponse;

public interface RecruiterProfileService {

    RecruiterProfileResponse createProfile(
            Long userId,
            RecruiterProfileRequest request);

    RecruiterProfileResponse getProfile(Long userId);

    RecruiterProfileResponse updateProfile(
            Long userId,
            RecruiterProfileRequest request);
}