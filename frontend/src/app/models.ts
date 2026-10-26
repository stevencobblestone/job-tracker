// Shapes of the data the backend sends and receives.

export type Status =
  | 'WISHLIST'
  | 'APPLIED'
  | 'PHONE_SCREEN'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

/** Board columns, in order, with a friendly label for each status. */
export const STATUSES: { value: Status; label: string }[] = [
  { value: 'WISHLIST', label: 'Wishlist' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'PHONE_SCREEN', label: 'Phone screen' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
];

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
