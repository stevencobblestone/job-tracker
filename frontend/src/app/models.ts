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
  notes: string | null;
  appliedDate: string | null; // "YYYY-MM-DD"
  status: Status;
  createdAt: string;
  updatedAt: string;
}

/** What we send on create/update (the server fills in id and timestamps). */
export type JobApplicationInput = Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>;

/** Response of GET /api/stats, e.g. { APPLIED: 3, OFFER: 1, ... } */
export type Stats = Record<Status, number>;

/**
 * 145000, 165000 -> "$145–165K". Small numbers (like an hourly rate 15, 40) stay as-is: "$15–40".
 * Returns "" when no salary is set.
 */
export function formatSalary(min: number | null, max: number | null): string {
  const big = (min ?? 0) >= 1000 || (max ?? 0) >= 1000;
  const fmt = (n: number) => (big ? String(Math.round(n / 1000)) : String(n));
  const unit = big ? 'K' : '';
  if (min != null && max != null) return `$${fmt(min)}–${fmt(max)}${unit}`;
  if (min != null) return `$${fmt(min)}${unit}+`;
  if (max != null) return `Up to $${fmt(max)}${unit}`;
  return '';
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
