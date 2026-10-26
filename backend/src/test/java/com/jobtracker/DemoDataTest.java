package com.jobtracker;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** With demo mode on, the sample data loads at startup: 12 applications across all stages. */
@SpringBootTest(properties = "app.demo-data=true")
@AutoConfigureMockMvc
@Testcontainers
class DemoDataTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Autowired MockMvc mvc;

    @Test
    void sampleDataIsLoaded() throws Exception {
        mvc.perform(get("/api/applications")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(12)));
        mvc.perform(get("/api/stats"))
                .andExpect(jsonPath("$.WISHLIST").value(2))
                .andExpect(jsonPath("$.APPLIED").value(3))
                .andExpect(jsonPath("$.OFFER").value(1));
        // Aperture Labs (id 10) went through 5 stages
        mvc.perform(get("/api/applications/10/events")).andExpect(jsonPath("$", hasSize(5)));
    }
}
