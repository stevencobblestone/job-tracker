package com.jobtracker.repository;

import com.jobtracker.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/** Spring Data generates the SQL for these methods automatically. */
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    /** Each row is [status, count], e.g. [APPLIED, 3]. */
    @Query("select a.status, count(a) from JobApplication a group by a.status")
    List<Object[]> countByStatus();
}
