package com.jobtracker.model;

/** The stages an application moves through. Order here = column order on the board. */
public enum ApplicationStatus {
    WISHLIST,
    APPLIED,
    PHONE_SCREEN,
    INTERVIEW,
    OFFER,
    REJECTED,
    WITHDRAWN
}
