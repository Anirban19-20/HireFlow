package com.anirban.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class JobOfferRequest {

    private BigDecimal offeredSalary;

    private String currency;

    private LocalDate joiningDate;

    private LocalDateTime expiresAt;

    private String message;


    public JobOfferRequest() {

    }


    public BigDecimal getOfferedSalary() {

        return offeredSalary;
    }

    public void setOfferedSalary(
            BigDecimal offeredSalary) {

        this.offeredSalary =
                offeredSalary;
    }


    public String getCurrency() {

        return currency;
    }

    public void setCurrency(
            String currency) {

        this.currency =
                currency;
    }


    public LocalDate getJoiningDate() {

        return joiningDate;
    }

    public void setJoiningDate(
            LocalDate joiningDate) {

        this.joiningDate =
                joiningDate;
    }


    public LocalDateTime getExpiresAt() {

        return expiresAt;
    }

    public void setExpiresAt(
            LocalDateTime expiresAt) {

        this.expiresAt =
                expiresAt;
    }


    public String getMessage() {

        return message;
    }

    public void setMessage(
            String message) {

        this.message =
                message;
    }
}