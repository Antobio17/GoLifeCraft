export type DiaryCalendarStatus = "green" | "orange" | "red" | "rest";

export interface DiaryCalendarDay {
  date: string;
  status: DiaryCalendarStatus;
  percent: number;
  entryCount: number;
}

export interface DiaryCalendarAttributes {
  month: string;
  days: DiaryCalendarDay[];
}

export interface DiaryCalendar {
  id: string;
  type: string;
  attributes: DiaryCalendarAttributes;
}

export interface GetDiaryCalendarResponse {
  data: DiaryCalendar;
}
