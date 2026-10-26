import { Component, OnInit, inject, input, output } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { JobApplication, JobApplicationInput, STATUSES } from '../models';

/** Form shown in a pop-up for adding a new application or editing/deleting an existing one. */
@Component({
  selector: 'app-application-form',
  imports: [ReactiveFormsModule],
  templateUrl: './application-form.html',
})
export class ApplicationForm implements OnInit {
  /** The application being edited, or null when adding a new one. */
  application = input<JobApplication | null>(null);
  saved = output<JobApplicationInput>();
  deleted = output<void>();
  cancelled = output<void>();

  readonly statuses = STATUSES;
  private fb = inject(FormBuilder);

  readonly form = this.fb.group(
    {
      company: ['', [Validators.required, Validators.maxLength(200)]],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      url: [''],
      location: [''],
      salaryMin: [null as number | null, Validators.min(0)],
      salaryMax: [null as number | null, Validators.min(0)],
      appliedDate: [''],
      status: ['WISHLIST'],
      notes: [''],
    },
    { validators: salaryRangeValidator },
  );

  ngOnInit() {
    // When editing, fill the form with the existing values.
    const app = this.application();
    if (app) {
      this.form.patchValue({
        ...app,
        url: app.url ?? '',
        location: app.location ?? '',
        appliedDate: app.appliedDate ?? '',
        notes: app.notes ?? '',
      });
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // show error messages
      return;
    }
    const v = this.form.getRawValue();
    // Empty text boxes are sent as null so the database stores "no value".
    this.saved.emit({
      company: v.company!.trim(),
      title: v.title!.trim(),
      url: v.url || null,
      location: v.location || null,
      salaryMin: v.salaryMin ?? null,
      salaryMax: v.salaryMax ?? null,
      appliedDate: v.appliedDate || null,
      status: v.status as JobApplicationInput['status'],
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
