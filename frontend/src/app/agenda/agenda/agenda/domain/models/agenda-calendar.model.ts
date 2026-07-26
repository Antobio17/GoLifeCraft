export interface AgendaCalendarDay {
  date: string;
  entryCount: number;
  pendingCount: number;
}

export interface AgendaCalendarAttributes {
  month: string;
  days: AgendaCalendarDay[];
}

export interface AgendaCalendar {
  id: string;
  type: string;
  attributes: AgendaCalendarAttributes;
}

export interface GetAgendaCalendarResponse {
  data: AgendaCalendar;
}
