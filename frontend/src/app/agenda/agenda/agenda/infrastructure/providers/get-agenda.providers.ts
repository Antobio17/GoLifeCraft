import { Provider } from "@angular/core";
import { GetAgendaDayPort } from "@agenda/agenda/agenda/domain/ports/get-agenda-day.port";
import { GetAgendaCalendarPort } from "@agenda/agenda/agenda/domain/ports/get-agenda-calendar.port";
import { HttpGetAgendaDayAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-get-agenda-day.adapter";
import { HttpGetAgendaCalendarAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-get-agenda-calendar.adapter";
import { GetAgendaDayService } from "@agenda/agenda/agenda/application/services/get-agenda-day.service";
import { GetAgendaCalendarService } from "@agenda/agenda/agenda/application/services/get-agenda-calendar.service";
import { AgendaViewService } from "@agenda/agenda/agenda/application/services/agenda-view.service";
import { AgendaCalendarViewService } from "@agenda/agenda/agenda/application/services/agenda-calendar-view.service";
import { AgendaCategoryCatalogService } from "@agenda/agenda/agenda/application/services/agenda-category-catalog.service";

export class GetAgendaProviders {
  static getProviders(): Provider[] {
    return [
      AgendaViewService,
      AgendaCalendarViewService,
      AgendaCategoryCatalogService,
      { provide: GetAgendaDayPort, useClass: HttpGetAgendaDayAdapter },
      {
        provide: GetAgendaDayService,
        useFactory: (port: GetAgendaDayPort) => new GetAgendaDayService(port),
        deps: [GetAgendaDayPort],
      },
      {
        provide: GetAgendaCalendarPort,
        useClass: HttpGetAgendaCalendarAdapter,
      },
      {
        provide: GetAgendaCalendarService,
        useFactory: (port: GetAgendaCalendarPort) =>
          new GetAgendaCalendarService(port),
        deps: [GetAgendaCalendarPort],
      },
    ];
  }
}
