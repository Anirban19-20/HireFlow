package com.anirban.service;

import com.anirban.dto.SavedJobResponse;

import java.util.List;

public interface SavedJobService {

    SavedJobResponse saveJob(
            Long candidateId,
            Long jobId
    );

    List<SavedJobResponse> getSavedJobs(
            Long candidateId
    );

    void removeSavedJob(
            Long candidateId,
            Long jobId
    );
}