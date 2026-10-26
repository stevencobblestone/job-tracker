import { Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';
import { JobApplication, ageInDays, formatDay, formatSalary, linkFor, statusInfo } from '../models';

/** Table view of the same applications as the board. Click a row to edit it. */
@Component({
  selector: 'app-applications-table',
  imports: [Icon],
  template: `
    <div class="table-panel">
      <div class="table-row table-head">
        <span class="col-role">ROLE &amp; COMPANY</span>
        <span class="col-stage">STAGE</span>
        <span class="col-comp">COMPENSATION</span>
        <span class="col-location">LOCATION</span>
        <span class="col-date">APPLIED</span>
        <span class="col-age">AGE</span>
      </div>

      @for (app of applications(); track app.id) {
        <div class="table-row" (click)="edit.emit(app)">
          <span class="col-role role-cell">
            <span class="company-mark" [style.background]="info(app).color">{{ app.company.charAt(0) }}</span>
            <span class="role-stack">
              <span class="row-role">{{ app.title }}</span>
              <span class="row-company">{{ app.company }}</span>
            </span>
            @if (linkFor(app.url); as link) {
              <a class="card-link" [href]="link" target="_blank" rel="noopener" title="Open job posting"
                 (click)="$event.stopPropagation()"><app-icon name="arrow-up-right" [size]="12" /></a>
            }
          </span>
          <span class="col-stage stage-cell">
            <span class="stage-dot" [style.background]="info(app).color"></span>{{ info(app).label }}
          </span>
          <span class="col-comp mono-dark">{{ formatSalary(app) || '—' }}</span>
          <span class="col-location mono">{{ app.location || '—' }}</span>
          <span class="col-date mono">{{ app.appliedDate ? formatDay(app.appliedDate) : '—' }}</span>
          <span class="col-age mono">{{ ageInDays(app) }}D</span>
        </div>
      } @empty {
        <div class="table-empty">No applications yet. Click “New application” to add one.</div>
      }
    </div>
  `,
})
export class ApplicationsTable {
  applications = input.required<JobApplication[]>();
  edit = output<JobApplication>();

  readonly info = (app: JobApplication) => statusInfo(app.status);
  readonly formatSalary = formatSalary;
  readonly formatDay = formatDay;
  readonly ageInDays = ageInDays;
  readonly linkFor = linkFor;
}
