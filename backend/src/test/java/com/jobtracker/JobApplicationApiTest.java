package com.jobtracker;

import com.jobtracker.repository.JobApplicationRepository;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-end API tests. Testcontainers starts a throwaway PostgreSQL in Docker,
 * Flyway runs the real migration on it, and MockMvc sends HTTP requests to the controller.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class JobApplicationApiTest {

    @Container
    @ServiceConnection // points Spring's datasource at this container automatically
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Autowired MockMvc mvc;
    @Autowired JobApplicationRepository repository;

    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll(); // status_event rows go too (ON DELETE CASCADE)
    }

    /** Helper: create an application and return its new id. */
    private long create(String json) throws Exception {
        String body = mvc.perform(post("/api/applications").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(body, "$.id")).longValue();
    }

    @Test
    void createAndGet() throws Exception {
        long id = create("""
                {"company":"Acme","title":"Java Developer","location":"Remote",
                 "salaryMin":90000,"salaryMax":110000,"appliedDate":"2026-10-01","status":"APPLIED"}""");

        mvc.perform(get("/api/applications/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company").value("Acme"))
                .andExpect(jsonPath("$.status").value("APPLIED"))
                .andExpect(jsonPath("$.appliedDate").value("2026-10-01"));
    }

    @Test
    void salaryPeriodIsSavedAndDefaulted() throws Exception {
        long hourly = create("""
                {"company":"A","title":"Intern","salaryMin":15,"salaryMax":40,"salaryPeriod":"HOURLY"}""");
        long yearly = create("""
                {"company":"B","title":"Dev","salaryMin":90000}""");  // no period given
        long blank = create("""
                {"company":"C","title":"Dev","salaryPeriod":"HOURLY"}"""); // no salary given

        mvc.perform(get("/api/applications/" + hourly)).andExpect(jsonPath("$.salaryPeriod").value("HOURLY"));
        mvc.perform(get("/api/applications/" + yearly)).andExpect(jsonPath("$.salaryPeriod").value("YEARLY"));
        mvc.perform(get("/api/applications/" + blank)).andExpect(jsonPath("$.salaryPeriod").doesNotExist());
    }

    @Test
    void statusDefaultsToWishlist() throws Exception {
        long id = create("""
                {"company":"Acme","title":"Dev"}""");
        mvc.perform(get("/api/applications/" + id)).andExpect(jsonPath("$.status").value("WISHLIST"));
    }

    @Test
    void listReturnsAll() throws Exception {
        create("""
                {"company":"A","title":"Dev"}""");
        create("""
                {"company":"B","title":"Dev"}""");
        mvc.perform(get("/api/applications")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void invalidInputIsRejected() throws Exception {
        // missing company and title
        mvc.perform(post("/api/applications").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
        // min salary above max salary
        mvc.perform(post("/api/applications").contentType(MediaType.APPLICATION_JSON).content("""
                        {"company":"A","title":"Dev","salaryMin":200,"salaryMax":100}"""))
                .andExpect(status().isBadRequest());
        // unknown status
        mvc.perform(post("/api/applications").contentType(MediaType.APPLICATION_JSON).content("""
                        {"company":"A","title":"Dev","status":"HIRED_ON_THE_SPOT"}"""))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateChangesFields() throws Exception {
        long id = create("""
                {"company":"Acme","title":"Dev"}""");
        mvc.perform(put("/api/applications/" + id).contentType(MediaType.APPLICATION_JSON).content("""
                        {"company":"Acme Corp","title":"Senior Dev","notes":"Referred by Sam","status":"WISHLIST"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company").value("Acme Corp"))
                .andExpect(jsonPath("$.notes").value("Referred by Sam"));
    }

    @Test
    void patchStatusLogsHistory() throws Exception {
        long id = create("""
                {"company":"Acme","title":"Dev","status":"APPLIED"}""");

        mvc.perform(patch("/api/applications/" + id + "/status").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"INTERVIEW\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INTERVIEW"));

        // Same status again should NOT add another history row
        mvc.perform(patch("/api/applications/" + id + "/status").contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"INTERVIEW\"}")).andExpect(status().isOk());

        mvc.perform(get("/api/applications/" + id + "/events"))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].fromStatus").doesNotExist())
                .andExpect(jsonPath("$[0].toStatus").value("APPLIED"))
                .andExpect(jsonPath("$[1].fromStatus").value("APPLIED"))
                .andExpect(jsonPath("$[1].toStatus").value("INTERVIEW"));
    }

    @Test
    void deleteRemovesApplication() throws Exception {
        long id = create("""
                {"company":"Acme","title":"Dev"}""");
        mvc.perform(delete("/api/applications/" + id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/applications/" + id)).andExpect(status().isNotFound());
    }

    @Test
    void missingApplicationReturns404() throws Exception {
        mvc.perform(get("/api/applications/999999")).andExpect(status().isNotFound());
        mvc.perform(patch("/api/applications/999999/status").contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"OFFER\"}")).andExpect(status().isNotFound());
    }

    @Test
    void statsCountsEveryStatus() throws Exception {
        create("""
                {"company":"A","title":"Dev","status":"APPLIED"}""");
        create("""
                {"company":"B","title":"Dev","status":"APPLIED"}""");
        create("""
                {"company":"C","title":"Dev","status":"OFFER"}""");

        mvc.perform(get("/api/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.APPLIED").value(2))
                .andExpect(jsonPath("$.OFFER").value(1))
                .andExpect(jsonPath("$.WISHLIST").value(0)); // zero counts are included too
    }
}
