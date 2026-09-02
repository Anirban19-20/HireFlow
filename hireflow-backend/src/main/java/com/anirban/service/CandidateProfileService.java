package com.anirban.service;

import com.anirban.dto.CandidateProfileRequest;
import com.anirban.dto.CandidateProfileResponse;

import org.springframework.web.multipart.MultipartFile;

public interface CandidateProfileService {

    CandidateProfileResponse createProfile(
            Long userId,
            CandidateProfileRequest request);

    CandidateProfileResponse getProfile(
            Long userId);

    CandidateProfileResponse updateProfile(
            Long userId,
            CandidateProfileRequest request);

    CandidateProfileResponse uploadResume(
            Long userId,
            MultipartFile file);
    
    CandidateProfileResponse deleteResume(
            Long userId
    );
}