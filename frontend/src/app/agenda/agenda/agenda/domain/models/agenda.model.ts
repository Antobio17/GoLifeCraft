export type AgendaEntryKind = "task" | "appointment";

export interface AgendaEntryView {
  id: string;
  entryDate: string;
  time: string | null;
  title: string;
  kind: AgendaEntryKind;
  category: string;
  notes: string;
  done: boolean;
}

export interface AgendaDayAttributes {
  date: string;
  entries: AgendaEntryView[];
  entryCount: number;
  pendingCount: number;
  doneCount: number;
}

export interface AgendaDay {
  id: string;
  type: string;
  attributes: AgendaDayAttributes;
}

export interface GetAgendaDayResponse {
  data: AgendaDay;
}
