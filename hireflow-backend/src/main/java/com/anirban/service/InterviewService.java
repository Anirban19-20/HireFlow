package com.anirban.service;

import com.anirban.dto.InterviewRequest;
import com.anirban.dto.InterviewResponse;

import java.util.List;

public interface InterviewService {

    // =====================================================
    // RECRUITER - SCHEDULE
    // =====================================================

    InterviewResponse scheduleInterview(
            Long recruiterId,
            Long applicationId,
            InterviewRequest request
    );

    // =====================================================
    // RECRUITER - UPDATE / RESCHEDULE
    // =====================================================

    InterviewResponse updateInterview(
            Long recruiterId,
            Long interviewId,
            InterviewRequest request
    );

    // =====================================================
    // RECRUITER - CANCEL
    // =====================================================

    InterviewResponse cancelInterview(
            Long recruiterId,
            Long interviewId
    );

    // =====================================================
    // RECRUITER - COMPLETE
    // =====================================================

    InterviewResponse completeInterview(
            Long recruiterId,
            Long interviewId
    );

    // =====================================================
    // RECRUITER - ALL INTERVIEWS
    // =====================================================

    List<InterviewResponse> getRecruiterInterviews(
            Long recruiterId
    );

    // =====================================================
    // RECRUITER - INTERVIEW ROUNDS FOR ONE APPLICATION
    // =====================================================

    List<InterviewResponse> getRecruiterApplicationInterviews(
            Long recruiterId,
            Long applicationId
    );

    // =====================================================
    // CANDIDATE - ALL INTERVIEWS
    // =====================================================

    List<InterviewResponse> getCandidateInterviews(
            Long candidateId
    );

    // =====================================================
    // CANDIDATE - ONE INTERVIEW
    // =====================================================

    InterviewResponse getCandidateInterview(
            Long candidateId,
            Long interviewId
    );
}