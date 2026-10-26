import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JobApplication, JobApplicationInput, Stats, Status, StatusEvent } from './models';

/** All calls to the backend REST API live here. */
@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private http = inject(HttpClient);
  private base = '/api/applications'; // forwarded to localhost:8080 by proxy.conf.json

  list() {
    return this.http.get<JobApplication[]>(this.base);
  }

  create(input: JobApplicationInput) {
    return this.http.post<JobApplication>(this.base, input);
  }

  update(id: number, input: JobApplicationInput) {
    return this.http.put<JobApplication>(`${this.base}/${id}`, input);
  }

  changeStatus(id: number, status: Status) {
    return this.http.patch<JobApplication>(`${this.base}/${id}/status`, { status });
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** Status history for one application, oldest first. */
  events(id: number) {
    return this.http.get<StatusEvent[]>(`${this.base}/${id}/events`);
  }

  stats() {
    return this.http.get<Stats>('/api/stats');
  }
}
