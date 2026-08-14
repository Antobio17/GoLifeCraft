import { Provider } from "@angular/core";
import { GetAgendaUpcomingPort } from "@agenda/agenda/agenda/domain/ports/get-agenda-upcoming.port";
import { GetAgendaSeriesPort } from "@agenda/agenda/agenda/domain/ports/get-agenda-series.port";
import { HttpGetAgendaUpcomingAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-get-agenda-upcoming.adapter";
import { HttpGetAgendaSeriesAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-get-agenda-series.adapter";
import { GetAgendaUpcomingService } from "@agenda/agenda/agenda/application/services/get-agenda-upcoming.service";
import { GetAgendaSeriesService } from "@agenda/agenda/agenda/application/services/get-agenda-series.service";
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
      {
        provide: GetAgendaSeriesPort,
        useClass: HttpGetAgendaSeriesAdapter,
      },
      {
        provide: GetAgendaSeriesService,
        useFactory: (port: GetAgendaSeriesPort) =>
          new GetAgendaSeriesService(port),
        deps: [GetAgendaSeriesPort],
      },
    ];
  }
}
