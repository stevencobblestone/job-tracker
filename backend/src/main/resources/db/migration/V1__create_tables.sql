-- One row per job application.
CREATE TABLE job_application (
    id            BIGSERIAL PRIMARY KEY,
    company       VARCHAR(200)  NOT NULL,
    title         VARCHAR(200)  NOT NULL,
    url           VARCHAR(1000),
    location      VARCHAR(200),
    salary_min    INTEGER,
    salary_max    INTEGER,
    notes         TEXT,
    applied_date  DATE,
    status        VARCHAR(20)   NOT NULL DEFAULT 'WISHLIST',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT chk_status CHECK (status IN
        ('WISHLIST','APPLIED','PHONE_SCREEN','INTERVIEW','OFFER','REJECTED','WITHDRAWN')),
    CONSTRAINT chk_salary CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
);

-- History: one row each time an application's status changes.
-- from_status is NULL for the first event (when the application is created).
CREATE TABLE status_event (
    id              BIGSERIAL PRIMARY KEY,
    application_id  BIGINT       NOT NULL REFERENCES job_application(id) ON DELETE CASCADE,
    from_status     VARCHAR(20),
    to_status       VARCHAR(20)  NOT NULL,
    changed_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_event_application ON status_event(application_id);
