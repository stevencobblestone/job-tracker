import { Component, computed, input } from '@angular/core';
import { Stats } from '../models';

/** The strip of five big numbers under the page title, all calculated from GET /api/stats. */
@Component({
  selector: 'app-metrics',
  template: `
    <div class="metrics">
      @for (m of metrics(); track m.label) {
        <div class="metric">
          <div class="metric-label">{{ m.label }}</div>
          <div class="metric-value-row">
            <span class="metric-value">{{ m.value }}</span>
            <span class="metric-note">{{ m.note }}</span>
          </div>
        </div>
      }
    </div>
  `,
})
export class Metrics {
  stats = input<Stats | null>(null);

  readonly metrics = computed(() => {
    const s = this.stats();
    const n = (key: keyof Stats) => s?.[key] ?? 0;
    const total = s ? Object.values(s).reduce((a, b) => a + b, 0) : 0;
    const sent = total - n('WISHLIST'); // applications actually submitted
    const responded = n('PHONE_SCREEN') + n('INTERVIEW') + n('OFFER') + n('REJECTED');

    return [
      { label: 'TRACKED', value: total, note: 'ALL STAGES' },
      { label: 'ACTIVE', value: n('APPLIED') + n('PHONE_SCREEN') + n('INTERVIEW'), note: 'IN PROGRESS' },
      { label: 'INTERVIEWS', value: n('PHONE_SCREEN') + n('INTERVIEW'), note: 'INCL. PHONE SCREENS' },
      { label: 'OFFERS', value: n('OFFER'), note: '' },
      { label: 'RESPONSE', value: sent ? Math.round((responded / sent) * 100) + '%' : '—', note: 'OF APPLICATIONS SENT' },
    ];
  });
}
