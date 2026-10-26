import { Component, computed, input, output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Icon } from '../icon/icon';
import { JobApplication, STATUSES, Status, formatDay, formatSalary, linkFor } from '../models';

/** Kanban board: one column per status. Dragging a card to another column emits statusChange. */
@Component({
  selector: 'app-board',
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, Icon],
  templateUrl: './board.html',
})
export class Board {
  applications = input.required<JobApplication[]>();
  edit = output<JobApplication>();
  add = output<Status>(); // "+" or "Add role" in a column
  statusChange = output<{ app: JobApplication; status: Status }>();

  readonly statuses = STATUSES;
  readonly formatSalary = formatSalary;
  readonly formatDay = formatDay;
  readonly linkFor = linkFor;

  /** Applications grouped by status, e.g. { APPLIED: [...], OFFER: [...] }. */
  readonly columns = computed(() => {
    const groups = {} as Record<Status, JobApplication[]>;
    for (const s of STATUSES) groups[s.value] = [];
    for (const app of this.applications()) groups[app.status].push(app);
    return groups;
  });

  pad(n: number) {
    return String(n).padStart(2, '0');
  }

  onDrop(event: CdkDragDrop<Status>) {
    const newStatus = event.container.data; // each column's data is its status
    const app: JobApplication = event.item.data;
    if (app.status !== newStatus) {
      this.statusChange.emit({ app, status: newStatus });
    }
  }
}
