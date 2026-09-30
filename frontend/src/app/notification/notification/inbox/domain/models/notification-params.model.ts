export interface NotificationParams {
  entryId?: string;
  title?: string;
  date?: string;
  time?: string | null;
  minutes?: number;
  meal?: string;
  variant?: string;
  items?: string | null;
  count?: number;
  workoutId?: string;
  sessionId?: string | null;
  sessionName?: string;
  elapsed?: string;
}
