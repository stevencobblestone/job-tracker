import { Component, input } from '@angular/core';

/** The handful of Lucide icons the design uses, drawn as inline SVG. Usage: <app-icon name="plus" /> */
@Component({
  selector: 'app-icon',
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @switch (name()) {
        @case ('layout-grid') {
          <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
        }
        @case ('layers') {
          <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
          <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
        }
        @case ('search') { <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /> }
        @case ('plus') { <path d="M5 12h14" /><path d="M12 5v14" /> }
        @case ('x') { <path d="M18 6 6 18" /><path d="m6 6 12 12" /> }
        @case ('calendar') {
          <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
        }
        @case ('columns-3') { <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" /><path d="M15 3v18" /> }
        @case ('table-2') {
          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
        }
        @case ('move-horizontal') { <path d="m18 8 4 4-4 4" /><path d="M2 12h20" /><path d="m6 8-4 4 4 4" /> }
        @case ('arrow-up-right') { <path d="M7 7h10v10" /><path d="M7 17 17 7" /> }
        @case ('check') { <path d="M20 6 9 17l-5-5" /> }
      }
    </svg>
  `,
  host: { style: 'display: inline-flex' },
})
export class Icon {
  name = input.required<string>();
  size = input(14);
}
