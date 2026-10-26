-- Pay type for the salary fields: YEARLY (e.g. 145000) or HOURLY (e.g. 40). NULL when no salary is set.
ALTER TABLE job_application ADD COLUMN salary_period VARCHAR(10);

ALTER TABLE job_application ADD CONSTRAINT chk_salary_period
    CHECK (salary_period IN ('YEARLY', 'HOURLY'));

-- Existing rows: amounts under 1000 were almost certainly hourly rates; everything else is yearly.
UPDATE job_application
SET salary_period = CASE WHEN COALESCE(salary_max, salary_min) < 1000 THEN 'HOURLY' ELSE 'YEARLY' END
WHERE salary_min IS NOT NULL OR salary_max IS NOT NULL;
