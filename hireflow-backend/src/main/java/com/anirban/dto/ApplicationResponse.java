package com.anirban.dto;

import com.anirban.entity.ApplicationStatus;

import java.time.LocalDateTime;

public class ApplicationResponse {

    private Long id;

    private Long jobId;

    private String jobTitle;
    
    private String companyName;

    private Long candidateId;

    private String candidateName;

    private String candidateEmail;

    private String resumeUrl;

    private String coverLetter;

    private ApplicationStatus status;

    private LocalDateTime appliedAt;

	public ApplicationResponse() {
		super();
		// TODO Auto-generated constructor stub
	}

	public ApplicationResponse(Long id, Long jobId, String jobTitle, String companyName, Long candidateId,
			String candidateName, String candidateEmail, String resumeUrl, String coverLetter, ApplicationStatus status,
			LocalDateTime appliedAt) {
		super();
		this.id = id;
		this.jobId = jobId;
		this.jobTitle = jobTitle;
		this.companyName = companyName;
		this.candidateId = candidateId;
		this.candidateName = candidateName;
		this.candidateEmail = candidateEmail;
		this.resumeUrl = resumeUrl;
		this.coverLetter = coverLetter;
		this.status = status;
		this.appliedAt = appliedAt;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getJobId() {
		return jobId;
	}

	public void setJobId(Long jobId) {
		this.jobId = jobId;
	}

	public String getJobTitle() {
		return jobTitle;
	}

	public void setJobTitle(String jobTitle) {
		this.jobTitle = jobTitle;
	}

	public String getCompanyName() {
		return companyName;
	}

	public void setCompanyName(String companyName) {
		this.companyName = companyName;
	}

	public Long getCandidateId() {
		return candidateId;
	}

	public void setCandidateId(Long candidateId) {
		this.candidateId = candidateId;
	}

	public String getCandidateName() {
		return candidateName;
	}

	public void setCandidateName(String candidateName) {
		this.candidateName = candidateName;
	}

	public String getCandidateEmail() {
		return candidateEmail;
	}

	public void setCandidateEmail(String candidateEmail) {
		this.candidateEmail = candidateEmail;
	}

	public String getResumeUrl() {
		return resumeUrl;
	}

	public void setResumeUrl(String resumeUrl) {
		this.resumeUrl = resumeUrl;
	}

	public String getCoverLetter() {
		return coverLetter;
	}

	public void setCoverLetter(String coverLetter) {
		this.coverLetter = coverLetter;
	}

	public ApplicationStatus getStatus() {
		return status;
	}

	public void setStatus(ApplicationStatus status) {
		this.status = status;
	}

	public LocalDateTime getAppliedAt() {
		return appliedAt;
	}

	public void setAppliedAt(LocalDateTime appliedAt) {
		this.appliedAt = appliedAt;
	}

    
}