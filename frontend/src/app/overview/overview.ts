import { Component, computed, input, output } from '@angular/core';
import { Icon } from '../icon/icon';
import { STATUSES, Stats } from '../models';

/** Overview page body: one bar per stage showing how many applications are in it. */
@Component({
  selector: 'app-overview',
  imports: [Icon],
  template: `
    <div class="panel">
      <div class="panel-head">
        <span class="panel-title">PIPELINE</span>
        <button class="panel-link" (click)="viewBoard.emit()">VIEW BOARD <app-icon name="arrow-up-right" [size]="11" /></button>
      </div>
      <div class="pipeline-body">
        @for (row of rows(); track row.value) {
          <div class="pipeline-row">
            <span class="pipeline-name">{{ row.label }}</span>
            <span class="track"><span class="bar" [style.width.%]="row.width" [style.background]="row.color"></span></span>
            <span class="pipeline-num">{{ row.count }}</span>
            <span class="pipeline-share">{{ row.share }}%</span>
          </div>
        }
      </div>
      <div class="panel-foot">BAR LENGTH = COUNT IN STAGE · % = SHARE OF ALL TRACKED ROLES</div>
    </div>
  `,
})
export class Overview {
  stats = input<Stats | null>(null);
  viewBoard = output<void>();

  readonly rows = computed(() => {
    const s = this.stats();
    const counts = STATUSES.map((st) => s?.[st.value] ?? 0);
    const max = Math.max(1, ...counts);
    const total = counts.reduce((a, b) => a + b, 0);
    return STATUSES.map((st, i) => ({
      ...st,
      count: String(counts[i]).padStart(2, '0'),
      width: (counts[i] / max) * 100,
      share: total ? Math.round((counts[i] / total) * 100) : 0,
    }));
  });
}
