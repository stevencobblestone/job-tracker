package com.jobtracker.service;

import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.SalaryPeriod;
import com.jobtracker.model.StatusEvent;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.StatusEventRepository;
import com.jobtracker.web.JobApplicationRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Business logic. Every status change is also recorded as a StatusEvent. */
@Service
@Transactional
public class JobApplicationService {

    private final JobApplicationRepository applications;
    private final StatusEventRepository events;

    public JobApplicationService(JobApplicationRepository applications, StatusEventRepository events) {
        this.applications = applications;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public List<JobApplication> findAll() {
        return applications.findAll(Sort.by(Sort.Direction.DESC, "updatedAt"));
    }

    @Transactional(readOnly = true)
    public JobApplication findById(Long id) {
        return applications.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application " + id + " not found"));
    }

    public JobApplication create(JobApplicationRequest request) {
        JobApplication app = new JobApplication();
        copyFields(request, app);
        app.setStatus(request.status() != null ? request.status() : ApplicationStatus.WISHLIST);
        fillAppliedDateIfMissing(app);
        app = applications.save(app);
        events.save(new StatusEvent(app.getId(), null, app.getStatus())); // first history entry
        return app;
    }

    public JobApplication update(Long id, JobApplicationRequest request) {
        JobApplication app = findById(id);
        copyFields(request, app);
        if (request.status() != null) {
            changeStatus(app, request.status());
        }
        return app;
    }

    public JobApplication updateStatus(Long id, ApplicationStatus newStatus) {
        JobApplication app = findById(id);
        changeStatus(app, newStatus);
        return app;
    }

    public void delete(Long id) {
        JobApplication app = findById(id); // throws 404 if missing
        applications.delete(app);          // history rows are removed by ON DELETE CASCADE
    }

    @Transactional(readOnly = true)
    public List<StatusEvent> history(Long id) {
        findById(id); // 404 if the application doesn't exist
        return events.findByApplicationIdOrderByChangedAtAscIdAsc(id);
    }

    /** Count per status. Every status is included, even when its count is 0. */
    @Transactional(readOnly = true)
    public Map<ApplicationStatus, Long> stats() {
        Map<ApplicationStatus, Long> counts = new LinkedHashMap<>();
        for (ApplicationStatus s : ApplicationStatus.values()) {
            counts.put(s, 0L);
        }
        for (Object[] row : applications.countByStatus()) {
            counts.put((ApplicationStatus) row[0], (Long) row[1]);
        }
        return counts;
    }

    /** Sets the new status and logs an event — but only if it actually changed. */
    private void changeStatus(JobApplication app, ApplicationStatus newStatus) {
        if (app.getStatus() != newStatus) {
            events.save(new StatusEvent(app.getId(), app.getStatus(), newStatus));
            app.setStatus(newStatus);
            fillAppliedDateIfMissing(app);
        }
    }

    /** Moving to APPLIED with no applied date? Assume it was sent today. */
    private void fillAppliedDateIfMissing(JobApplication app) {
        if (app.getStatus() == ApplicationStatus.APPLIED && app.getAppliedDate() == null) {
            app.setAppliedDate(LocalDate.now());
        }
    }

    private void copyFields(JobApplicationRequest r, JobApplication app) {
        app.setCompany(r.company());
        app.setTitle(r.title());
        app.setUrl(r.url());
        app.setLocation(r.location());
        app.setSalaryMin(r.salaryMin());
        app.setSalaryMax(r.salaryMax());
        // Pay type only means something when there's a salary; default to yearly if not given.
        boolean hasSalary = r.salaryMin() != null || r.salaryMax() != null;
        app.setSalaryPeriod(!hasSalary ? null : r.salaryPeriod() != null ? r.salaryPeriod() : SalaryPeriod.YEARLY);
        app.setNotes(r.notes());
        app.setAppliedDate(r.appliedDate());
    }
}
