package com.jobtracker.web;

import com.jobtracker.model.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

/** JSON body for PATCH /api/applications/{id}/status, e.g. {"status": "INTERVIEW"}. */
public record StatusChangeRequest(@NotNull ApplicationStatus status) { }
