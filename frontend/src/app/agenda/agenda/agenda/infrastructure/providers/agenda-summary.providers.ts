import { Provider } from "@angular/core";
import { GetAgendaUpcomingPort } from "@agenda/agenda/agenda/domain/ports/get-agenda-upcoming.port";
import { HttpGetAgendaUpcomingAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-get-agenda-upcoming.adapter";
import { GetAgendaUpcomingService } from "@agenda/agenda/agenda/application/services/get-agenda-upcoming.service";
import { AgendaViewService } from "@agenda/agenda/agenda/application/services/agenda-view.service";
import { AgendaCategoryCatalogService } from "@agenda/agenda/agenda/application/services/agenda-category-catalog.service";

export class AgendaSummaryProviders {
  static getProviders(): Provider[] {
    return [
      AgendaViewService,
      AgendaCategoryCatalogService,
      {
        provide: GetAgendaUpcomingPort,
        useClass: HttpGetAgendaUpcomingAdapter,
      },
      {
        provide: GetAgendaUpcomingService,
        useFactory: (port: GetAgendaUpcomingPort) =>
          new GetAgendaUpcomingService(port),
        deps: [GetAgendaUpcomingPort],
      },
    ];
  }
}
