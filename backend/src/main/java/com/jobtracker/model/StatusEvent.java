package com.jobtracker.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/** A history row: an application moved from one status to another. */
@Entity
@Table(name = "status_event")
public class StatusEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long applicationId;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus fromStatus; // null for the very first event

    @Enumerated(EnumType.STRING)
    private ApplicationStatus toStatus;

    @CreationTimestamp
    private Instant changedAt;

    protected StatusEvent() { } // required by JPA

    public StatusEvent(Long applicationId, ApplicationStatus fromStatus, ApplicationStatus toStatus) {
        this.applicationId = applicationId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
    }

    public Long getId() { return id; }
    public Long getApplicationId() { return applicationId; }
    public ApplicationStatus getFromStatus() { return fromStatus; }
    public ApplicationStatus getToStatus() { return toStatus; }
    public Instant getChangedAt() { return changedAt; }
}
