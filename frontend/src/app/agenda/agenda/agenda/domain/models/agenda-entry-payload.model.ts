import { AgendaEntryKind } from "./agenda.model";

export interface AgendaEntryPayload {
  entryDate: string;
  time: string | null;
  title: string;
  kind: AgendaEntryKind;
  category: string;
  notes: string;
}

export interface AgendaEntrySeriesPayload {
  entryDate: string;
  endDate: string;
  title: string;
  kind: AgendaEntryKind;
  category: string;
  notes: string;
}
