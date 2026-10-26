package com.jobtracker.web;

import com.jobtracker.model.ApplicationStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

/** JSON body for create (POST) and update (PUT). Validation rules live on the fields. */
public record JobApplicationRequest(
        @NotBlank @Size(max = 200) String company,
        @NotBlank @Size(max = 200) String title,
        @Size(max = 1000) String url,
        @Size(max = 200) String location,
        @PositiveOrZero Integer salaryMin,
        @PositiveOrZero Integer salaryMax,
        String notes,
        LocalDate appliedDate,
        ApplicationStatus status // optional; defaults to WISHLIST on create
) {
    /** Cross-field rule: min salary can't be above max salary. */
    @AssertTrue(message = "salaryMin must not be greater than salaryMax")
    public boolean isSalaryRangeValid() {
        return salaryMin == null || salaryMax == null || salaryMin <= salaryMax;
    }
}
