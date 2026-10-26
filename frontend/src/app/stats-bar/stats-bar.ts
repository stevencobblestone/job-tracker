import { Component, computed, input } from '@angular/core';
import { STATUSES, Stats } from '../models';

/** Small summary row: total plus a count for each status (from GET /api/stats). */
@Component({
  selector: 'app-stats-bar',
  template: `
    <div class="stats">
      <span class="stat total">Total <b>{{ total() }}</b></span>
      @for (s of statuses; track s.value) {
        <span class="stat">{{ s.label }} <b>{{ stats()?.[s.value] ?? 0 }}</b></span>
      }
    </div>
  `,
})
export class StatsBar {
  stats = input<Stats | null>(null);
  readonly statuses = STATUSES;

  readonly total = computed(() => {
    const s = this.stats();
    return s ? Object.values(s).reduce((sum, n) => sum + n, 0) : 0;
  });
}
