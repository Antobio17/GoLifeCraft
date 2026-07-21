import { Provider } from "@angular/core";
import { GetDiaryPort } from "@nutrition/diary/diary/domain/ports/get-diary.port";
import { HttpGetDiaryAdapter } from "@nutrition/diary/diary/infrastructure/adapters/http-get-diary.adapter";
import { GetDiaryService } from "@nutrition/diary/diary/application/services/get-diary.service";
import { DiaryViewService } from "@nutrition/diary/diary/application/services/diary-view.service";
import { GetDiaryCalendarPort } from "@nutrition/diary/diary/domain/ports/get-diary-calendar.port";
import { HttpGetDiaryCalendarAdapter } from "@nutrition/diary/diary/infrastructure/adapters/http-get-diary-calendar.adapter";
import { GetDiaryCalendarService } from "@nutrition/diary/diary/application/services/get-diary-calendar.service";
import { DiaryCalendarViewService } from "@nutrition/diary/diary/application/services/diary-calendar-view.service";

export class GetDiaryProviders {
  static getProviders(): Provider[] {
    return [
      DiaryViewService,
      DiaryCalendarViewService,
      { provide: GetDiaryPort, useClass: HttpGetDiaryAdapter },
      {
        provide: GetDiaryService,
        useFactory: (port: GetDiaryPort) => new GetDiaryService(port),
        deps: [GetDiaryPort],
      },
      { provide: GetDiaryCalendarPort, useClass: HttpGetDiaryCalendarAdapter },
      {
        provide: GetDiaryCalendarService,
        useFactory: (port: GetDiaryCalendarPort) =>
          new GetDiaryCalendarService(port),
        deps: [GetDiaryCalendarPort],
      },
    ];
  }
}
