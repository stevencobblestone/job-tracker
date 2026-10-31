// Shapes of the data the backend sends and receives, plus small display helpers.

export type Status =
  | 'WISHLIST'
  | 'APPLIED'
  | 'PHONE_SCREEN'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

/** Board columns, in order, with a friendly label and the stage color from the design. */
export const STATUSES: { value: Status; label: string; color: string }[] = [
  { value: 'WISHLIST', label: 'Wishlist', color: '#5E6D66' },
  { value: 'APPLIED', label: 'Applied', color: '#2B5BD7' },
  { value: 'PHONE_SCREEN', label: 'Phone screen', color: '#7A4FC4' },
  { value: 'INTERVIEW', label: 'Interview', color: '#A96107' },
  { value: 'OFFER', label: 'Offer', color: '#0B7A52' },
  { value: 'REJECTED', label: 'Rejected', color: '#B2442E' },
  { value: 'WITHDRAWN', label: 'Withdrawn', color: '#9AA6A0' },
];

/** Stages where the process is over. "Hide closed" hides these. */
export const CLOSED_STATUSES: Status[] = ['REJECTED', 'WITHDRAWN'];

export function statusInfo(status: Status) {
  return STATUSES.find((s) => s.value === status)!;
}

export interface JobApplication {
  id: number;
  company: string;
  title: string;
  url: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: SalaryPeriod | null; // null when no salary is set
  notes: string | null;
  appliedDate: string | null; // "YYYY-MM-DD"
  status: Status;
  createdAt: string;
  updatedAt: string;
}

/** What we send on create/update (the server fills in id and timestamps). */
export type JobApplicationInput = Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>;

/** One history row from GET /api/applications/{id}/events. fromStatus is null for "added". */
export interface StatusEvent {
  id: number;
  fromStatus: Status | null;
  toStatus: Status;
  changedAt: string;
}

/**
 * Turns what the user typed into a link we can open, or null if it doesn't look like one.
 * "acme.com/jobs/1" -> "https://acme.com/jobs/1"; "test" -> null.
 */
export function linkFor(url: string | null): string | null {
  const u = url?.trim();
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  return /^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(u) ? 'https://' + u : null;
}

/** "2026-10-26T18:57:46Z" -> "OCT 26 · 2:57 PM" in the viewer's own time zone. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
  const time = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${day} · ${time}`;
}

/** Response of GET /api/stats, e.g. { APPLIED: 3, OFFER: 1, ... } */
export type Stats = Record<Status, number>;

export type SalaryPeriod = 'YEARLY' | 'HOURLY';

/**
 * Yearly 145000–165000 -> "$145–165K"; hourly 15–40 -> "$15–40/hr".
 * A single amount works too ("$120K", "$25/hr"). Returns "" when no salary is set.
 */
export function formatSalary(app: Pick<JobApplication, 'salaryMin' | 'salaryMax' | 'salaryPeriod'>): string {
  const { salaryMin: min, salaryMax: max } = app;
  if (min == null && max == null) return '';
  const hourly = app.salaryPeriod === 'HOURLY';
  // Yearly amounts are shown in thousands ("145K"); hourly amounts as they are.
  const inK = !hourly && Math.max(min ?? 0, max ?? 0) >= 1000;
  const fmt = (n: number) => (inK ? String(Math.round(n / 1000)) : String(n));
  const unit = hourly ? '/hr' : inK ? 'K' : '';

  if (min != null && max != null && min !== max) return `$${fmt(min)}–${fmt(max)}${unit}`;
  return `$${fmt((min ?? max)!)}${unit}`; // one amount (or min equals max)
}

/** "2026-05-02" -> "MAY 02". Parsed by hand so the date never shifts with time zones. */
export function formatDay(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number);
  const month = new Date(y, m - 1, d).toLocaleString('en-US', { month: 'short' }).toUpperCase();
  return `${month} ${String(d).padStart(2, '0')}`;
}

/** Days since the application was sent (or added, if there's no applied date). */
export function ageInDays(app: JobApplication): number {
  const start = new Date(app.appliedDate ? app.appliedDate + 'T00:00:00' : app.createdAt);
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 86_400_000));
}
