import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { retry } from 'rxjs';
import { ApplicationService } from './application.service';
import { JobApplication, JobApplicationInput, Stats, Status } from './models';
import { Icon } from './icon/icon';
import { Sidebar, Page } from './sidebar/sidebar';
import { Metrics } from './metrics/metrics';
import { Board } from './board/board';
import { ApplicationsTable } from './applications-table/applications-table';
import { Overview } from './overview/overview';
import { ApplicationForm } from './application-form/application-form';

/** Top-level page: loads data from the API and connects the sidebar, pages and form. */
@Component({
  selector: 'app-root',
  imports: [Icon, Sidebar, Metrics, Board, ApplicationsTable, Overview, ApplicationForm],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private api = inject(ApplicationService);

  readonly applications = signal<JobApplication[]>([]);
  readonly stats = signal<Stats | null>(null);
  readonly error = signal<string | null>(null);

  // Which page and which view (board or table) are showing.
  readonly page = signal<Page>('applications');
  readonly view = signal<'board' | 'table'>('board');

  // Search box: filters by company or role.
  readonly query = signal('');
  readonly visibleApps = computed(() => {
    const q = this.query().trim().toLowerCase();
    const apps = this.applications();
    return q ? apps.filter((a) => (a.company + ' ' + a.title).toLowerCase().includes(q)) : apps;
  });

  readonly total = computed(() => this.applications().length);
  readonly inMotion = computed(
    () => this.applications().filter((a) => ['APPLIED', 'PHONE_SCREEN', 'INTERVIEW'].includes(a.status)).length,
  );

  // Form state: closed, adding a new application, or editing one.
  readonly formOpen = signal(false);
  readonly editing = signal<JobApplication | null>(null);
  readonly newStatus = signal<Status>('WISHLIST');

  // True until the first data arrives. On free hosting the backend sleeps when idle,
  // so the first load can take up to a minute; after 2 seconds we explain that.
  readonly loading = signal(true);
  readonly slowStart = signal(false);

  ngOnInit() {
    setTimeout(() => this.slowStart.set(this.loading()), 2000);
    this.reload();
  }

  /** Fetch the list and the stats again from the backend. */
  reload() {
    this.api
      .list()
      .pipe(retry({ count: 12, delay: 5000 })) // keep trying for ~1 minute while the server wakes up
      .subscribe({
        next: (apps) => {
          this.applications.set(apps);
          this.error.set(null);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Could not reach the backend. Is it running?');
        },
      });
    this.api
      .stats()
      .pipe(retry({ count: 12, delay: 5000 }))
      .subscribe({ next: (s) => this.stats.set(s), error: () => {} });
  }

  openNew(status: Status = 'WISHLIST') {
    this.editing.set(null);
    this.newStatus.set(status);
    this.formOpen.set(true);
  }

  openEdit(app: JobApplication) {
    this.editing.set(app);
    this.formOpen.set(true);
  }

  closeForm() {
    this.formOpen.set(false);
  }

  save(input: JobApplicationInput) {
    const current = this.editing();
    const request = current ? this.api.update(current.id, input) : this.api.create(input);
    request.subscribe({
      next: () => {
        this.closeForm();
        this.reload();
      },
      error: () => this.error.set('Save failed. Please check the form and try again.'),
    });
  }

  remove() {
    const current = this.editing();
    if (!current) return;
    this.api.delete(current.id).subscribe({
      next: () => {
        this.closeForm();
        this.reload();
      },
      error: () => this.error.set('Delete failed.'),
    });
  }

  /** Called when a card is dropped in a new column. */
  changeStatus(event: { app: JobApplication; status: Status }) {
    // Move the card right away so the board feels instant...
    this.applications.update((apps) =>
      apps.map((a) => (a.id === event.app.id ? { ...a, status: event.status } : a)),
    );
    // ...then save it. Reloading afterwards keeps the board and stats in sync with the server.
    this.api.changeStatus(event.app.id, event.status).subscribe({
      next: () => this.reload(),
      error: () => {
        this.error.set('Could not change the status.');
        this.reload(); // put the card back where the server says it is
      },
    });
  }

  showBoard() {
    this.page.set('applications');
    this.view.set('board');
  }
}
