import { Provider } from "@angular/core";
import { GetAgendaDayPort } from "@agenda/agenda/agenda/domain/ports/get-agenda-day.port";
import { HttpGetAgendaDayAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-get-agenda-day.adapter";
import { GetAgendaDayService } from "@agenda/agenda/agenda/application/services/get-agenda-day.service";
import { AgendaViewService } from "@agenda/agenda/agenda/application/services/agenda-view.service";
import { AgendaCategoryCatalogService } from "@agenda/agenda/agenda/application/services/agenda-category-catalog.service";

export class AgendaSummaryProviders {
  static getProviders(): Provider[] {
    return [
      AgendaViewService,
      AgendaCategoryCatalogService,
      { provide: GetAgendaDayPort, useClass: HttpGetAgendaDayAdapter },
      {
        provide: GetAgendaDayService,
        useFactory: (port: GetAgendaDayPort) => new GetAgendaDayService(port),
        deps: [GetAgendaDayPort],
      },
    ];
  }
}
