package com.jobtracker.repository;

import com.jobtracker.model.StatusEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StatusEventRepository extends JpaRepository<StatusEvent, Long> {

    /** History for one application, oldest first. */
    List<StatusEvent> findByApplicationIdOrderByChangedAtAscIdAsc(Long applicationId);
}
