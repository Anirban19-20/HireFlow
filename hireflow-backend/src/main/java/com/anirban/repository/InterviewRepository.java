package com.anirban.repository;

import com.anirban.entity.Interview;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository
        extends JpaRepository<Interview, Long> {

    // =====================================================
    // CANDIDATE INTERVIEWS
    // =====================================================

    List<Interview>
    findByApplicationCandidateIdOrderByScheduledAtAsc(
            Long candidateId);

    // =====================================================
    // RECRUITER INTERVIEWS
    // =====================================================

    List<Interview>
    findByApplicationJobRecruiterIdOrderByScheduledAtAsc(
            Long recruiterId);

    // =====================================================
    // ALL ROUNDS FOR ONE APPLICATION
    // =====================================================

    List<Interview>
    findByApplicationIdOrderByRoundNumberAscScheduledAtAsc(
            Long applicationId);

    // =====================================================
    // RECRUITER OWNERSHIP
    // =====================================================

    Optional<Interview>
    findByIdAndApplicationJobRecruiterId(
            Long interviewId,
            Long recruiterId);

    // =====================================================
    // CANDIDATE OWNERSHIP
    // =====================================================

    Optional<Interview>
    findByIdAndApplicationCandidateId(
            Long interviewId,
            Long candidateId);
}