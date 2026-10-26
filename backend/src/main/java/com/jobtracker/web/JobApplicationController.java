package com.jobtracker.web;

import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.StatusEvent;
import com.jobtracker.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** REST endpoints. The controller only translates HTTP <-> service calls. */
@RestController
@RequestMapping("/api")
public class JobApplicationController {

    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    @GetMapping("/applications")
    public List<JobApplication> list() {
        return service.findAll();
    }

    @GetMapping("/applications/{id}")
    public JobApplication get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping("/applications")
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplication create(@Valid @RequestBody JobApplicationRequest request) {
        return service.create(request);
    }

    @PutMapping("/applications/{id}")
    public JobApplication update(@PathVariable Long id, @Valid @RequestBody JobApplicationRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/applications/{id}/status")
    public JobApplication changeStatus(@PathVariable Long id, @Valid @RequestBody StatusChangeRequest request) {
        return service.updateStatus(id, request.status());
    }

    @DeleteMapping("/applications/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/applications/{id}/events")
    public List<StatusEvent> history(@PathVariable Long id) {
        return service.history(id);
    }

    @GetMapping("/stats")
    public Map<ApplicationStatus, Long> stats() {
        return service.stats();
    }
}
