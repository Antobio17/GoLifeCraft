import { AgendaEntryKind } from "./agenda.model";

export interface AgendaSeriesAttributes {
  seriesId: string;
  entryDate: string;
  endDate: string;
  title: string;
  kind: AgendaEntryKind;
  category: string;
  notes: string;
  entryCount: number;
  pendingCount: number;
  doneCount: number;
}

export interface AgendaSeries {
  id: string;
  type: string;
  attributes: AgendaSeriesAttributes;
}

export interface GetAgendaSeriesResponse {
  data: AgendaSeries;
}
