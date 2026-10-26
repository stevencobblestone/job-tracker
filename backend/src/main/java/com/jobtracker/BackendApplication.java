package com.jobtracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Entry point: starts the web server (port 8080 locally, or $PORT when hosted). */
@SpringBootApplication
@EnableScheduling // lets the demo reset itself nightly (see DemoDataLoader)
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
