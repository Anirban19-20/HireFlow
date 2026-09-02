package com.anirban.dto;

import com.anirban.entity.OnboardingStatus;

public class CandidateOnboardingStatusRequest {

    private OnboardingStatus status;


    public CandidateOnboardingStatusRequest() {

    }


    public OnboardingStatus getStatus() {

        return status;
    }

    public void setStatus(
            OnboardingStatus status) {

        this.status =
                status;
    }
}
