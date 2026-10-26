import { Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';
import { STATUSES, Stats } from '../models';

export type Page = 'overview' | 'applications';

/** Dark left sidebar: brand, page links, and a count for each pipeline stage. */
@Component({
  selector: 'app-sidebar',
  imports: [Icon],
  template: `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">P</div>
        <div>
          <div class="brand-word">PURSUIT</div>
          <div class="brand-tag">JOB LEDGER</div>
        </div>
      </div>

      <nav>
        <div class="nav-section">WORKSPACE</div>
        <button class="nav-item" [class.active]="page() === 'overview'" (click)="navigate.emit('overview')">
          <app-icon name="layout-grid" [size]="15" /> Overview
        </button>
        <button class="nav-item" [class.active]="page() === 'applications'" (click)="navigate.emit('applications')">
          <app-icon name="layers" [size]="15" /> Applications
        </button>

        <div class="nav-section">PIPELINE</div>
        @for (s of statuses; track s.value) {
          <div class="pipeline-item">
            <span class="pipeline-left"><span class="dot" [style.background]="s.color"></span>{{ s.label }}</span>
            <span class="pipeline-count">{{ stats()?.[s.value] ?? 0 }}</span>
          </div>
        }
      </nav>
    </aside>
  `,
})
export class Sidebar {
  page = input.required<Page>();
  stats = input<Stats | null>(null);
  navigate = output<Page>();
  readonly statuses = STATUSES;
}
