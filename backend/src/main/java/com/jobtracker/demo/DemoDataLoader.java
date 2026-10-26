package com.jobtracker.demo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * Public demo only: loads sample data (demo-data.sql) at startup and resets it every night,
 * so anything visitors change or delete fixes itself. Turned on with DEMO_DATA=true;
 * off by default, so it never touches a real database.
 */
@Component
@ConditionalOnProperty(name = "app.demo-data", havingValue = "true")
public class DemoDataLoader {

    private static final Logger log = LoggerFactory.getLogger(DemoDataLoader.class);
    private final DataSource dataSource;

    public DemoDataLoader(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        reset();
    }

    @Scheduled(cron = "0 0 4 * * *") // every day at 4:00 AM (server time zone)
    public void nightly() {
        reset();
    }

    void reset() {
        new ResourceDatabasePopulator(new ClassPathResource("demo-data.sql")).execute(dataSource);
        log.info("Demo data loaded");
    }
}
