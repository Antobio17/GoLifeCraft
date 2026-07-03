export interface DomainEventLog {
  id: string;
  eventName: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  occurredOn: string;
  recordedAt: string;
  user: DomainEventLogUser;
}

export interface DomainEventLogUser {
  id: string;
  username: string;
  name: string;
  lastname: string;
}

export const KNOWN_EVENT_NAMES: string[] = [
  "user.created",
  "user.updated",
  "user.deleted",
  "user.my_theme_changed",
  "file.deleted",
  "folder.deleted",
];
