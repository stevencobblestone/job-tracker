import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { ApplicationService } from '../application.service';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Icon } from '../icon/icon';
import {
  JobApplication, JobApplicationInput, STATUSES, SalaryPeriod, Status, StatusEvent,
  formatDateTime, linkFor, statusInfo,
} from '../models';

/** "Add a role" pop-up for adding a new application or editing/deleting an existing one. */
@Component({
  selector: 'app-application-form',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './application-form.html',
  host: {
    '(document:keydown.escape)': 'cancelled.emit()',
    '(document:keydown.control.enter)': 'submit()',
    '(document:keydown.meta.enter)': 'submit()',
  },
})
export class ApplicationForm implements OnInit {
  /** The application being edited, or null when adding a new one. */
  application = input<JobApplication | null>(null);
  /** Stage to start with when adding (e.g. from a column's "+" button). */
  initialStatus = input<Status>('WISHLIST');
  saved = output<JobApplicationInput>();
  deleted = output<void>();
  cancelled = output<void>();

  readonly statuses = STATUSES;
  readonly statusInfo = statusInfo;
  readonly formatDateTime = formatDateTime;
  private fb = inject(FormBuilder);
  private api = inject(ApplicationService);

  /** Status history, newest first (only loaded when editing). */
  readonly history = signal<StatusEvent[]>([]);

  readonly form = this.fb.group(
    {
      company: ['', [Validators.required, Validators.maxLength(200)]],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      url: [''],
      location: [''],
      salaryMin: [null as number | null, Validators.min(0)],
      salaryMax: [null as number | null, Validators.min(0)],
      salaryPeriod: ['YEARLY' as SalaryPeriod],
      appliedDate: [''],
      status: ['WISHLIST' as Status],
      notes: [''],
    },
    { validators: salaryRangeValidator },
  );

  ngOnInit() {
    const app = this.application();
    if (app) {
      // Editing: fill the form with the existing values.
      this.form.patchValue({
        ...app,
        url: app.url ?? '',
        location: app.location ?? '',
        appliedDate: app.appliedDate ?? '',
        notes: app.notes ?? '',
        salaryPeriod: app.salaryPeriod ?? 'YEARLY',
      });
      this.api.events(app.id).subscribe({
        next: (events) => this.history.set([...events].reverse()),
        error: () => {}, // history is a nice-to-have; the form still works without it
      });
    } else {
      this.form.patchValue({ status: this.initialStatus() });
    }
  }

  setStatus(status: Status) {
    this.form.controls.status.setValue(status);
  }

  setPeriod(period: SalaryPeriod) {
    this.form.controls.salaryPeriod.setValue(period);
  }

  /** Openable version of the URL box's current value (null if it isn't a link). */
  get link() {
    return linkFor(this.form.controls.url.value);
  }

  get hourly() {
    return this.form.controls.salaryPeriod.value === 'HOURLY';
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // show error messages
      return;
    }
    const v = this.form.getRawValue();
    const hasSalary = v.salaryMin != null || v.salaryMax != null;
    // Empty text boxes are sent as null so the database stores "no value".
    this.saved.emit({
      company: v.company!.trim(),
      title: v.title!.trim(),
      url: v.url || null,
      location: v.location || null,
      salaryMin: v.salaryMin ?? null,
      salaryMax: v.salaryMax ?? null,
      salaryPeriod: hasSalary ? v.salaryPeriod! : null, // pay type only matters when there's a salary
      appliedDate: v.appliedDate || null,
      status: v.status!,
      notes: v.notes || null,
    });
  }

  confirmDelete() {
    if (confirm('Delete this application?')) {
      this.deleted.emit();
    }
  }
}

/** Min salary can't be bigger than max salary (same rule as the backend). */
function salaryRangeValidator(group: AbstractControl): ValidationErrors | null {
  const min = group.get('salaryMin')?.value;
  const max = group.get('salaryMax')?.value;
  return min != null && max != null && min > max ? { salaryRange: true } : null;
}
