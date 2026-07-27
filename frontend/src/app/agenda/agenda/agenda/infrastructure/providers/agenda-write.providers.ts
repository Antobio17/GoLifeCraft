import { Provider } from "@angular/core";
import { CreateAgendaEntryPort } from "@agenda/agenda/agenda/domain/ports/create-agenda-entry.port";
import { CreateAgendaEntrySeriesPort } from "@agenda/agenda/agenda/domain/ports/create-agenda-entry-series.port";
import { UpdateAgendaEntryPort } from "@agenda/agenda/agenda/domain/ports/update-agenda-entry.port";
import { UpdateAgendaEntrySeriesPort } from "@agenda/agenda/agenda/domain/ports/update-agenda-entry-series.port";
import { GetAgendaSeriesPort } from "@agenda/agenda/agenda/domain/ports/get-agenda-series.port";
import { HttpUpdateAgendaEntrySeriesAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-update-agenda-entry-series.adapter";
import { HttpGetAgendaSeriesAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-get-agenda-series.adapter";
import { UpdateAgendaEntrySeriesService } from "@agenda/agenda/agenda/application/services/update-agenda-entry-series.service";
import { GetAgendaSeriesService } from "@agenda/agenda/agenda/application/services/get-agenda-series.service";
import { ChangeAgendaEntryStatusPort } from "@agenda/agenda/agenda/domain/ports/change-agenda-entry-status.port";
import { DeleteAgendaEntryPort } from "@agenda/agenda/agenda/domain/ports/delete-agenda-entry.port";
import { DeleteAgendaEntrySeriesPort } from "@agenda/agenda/agenda/domain/ports/delete-agenda-entry-series.port";
import { HttpCreateAgendaEntryAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-create-agenda-entry.adapter";
import { HttpCreateAgendaEntrySeriesAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-create-agenda-entry-series.adapter";
import { HttpUpdateAgendaEntryAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-update-agenda-entry.adapter";
import { HttpChangeAgendaEntryStatusAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-change-agenda-entry-status.adapter";
import { HttpDeleteAgendaEntryAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-delete-agenda-entry.adapter";
import { HttpDeleteAgendaEntrySeriesAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-delete-agenda-entry-series.adapter";
import { CreateAgendaEntryService } from "@agenda/agenda/agenda/application/services/create-agenda-entry.service";
import { CreateAgendaEntrySeriesService } from "@agenda/agenda/agenda/application/services/create-agenda-entry-series.service";
import { UpdateAgendaEntryService } from "@agenda/agenda/agenda/application/services/update-agenda-entry.service";
import { ChangeAgendaEntryStatusService } from "@agenda/agenda/agenda/application/services/change-agenda-entry-status.service";
import { DeleteAgendaEntryService } from "@agenda/agenda/agenda/application/services/delete-agenda-entry.service";
import { DeleteAgendaEntrySeriesService } from "@agenda/agenda/agenda/application/services/delete-agenda-entry-series.service";
import { AgendaEntryFormService } from "@agenda/agenda/agenda/application/services/agenda-entry-form.service";

export class AgendaWriteProviders {
  static getProviders(): Provider[] {
    return [
      AgendaEntryFormService,
      {
        provide: CreateAgendaEntryPort,
        useClass: HttpCreateAgendaEntryAdapter,
      },
      {
        provide: CreateAgendaEntryService,
        useFactory: (port: CreateAgendaEntryPort) =>
          new CreateAgendaEntryService(port),
        deps: [CreateAgendaEntryPort],
      },
      {
        provide: CreateAgendaEntrySeriesPort,
        useClass: HttpCreateAgendaEntrySeriesAdapter,
      },
      {
        provide: CreateAgendaEntrySeriesService,
        useFactory: (port: CreateAgendaEntrySeriesPort) =>
          new CreateAgendaEntrySeriesService(port),
        deps: [CreateAgendaEntrySeriesPort],
      },
      {
        provide: UpdateAgendaEntryPort,
        useClass: HttpUpdateAgendaEntryAdapter,
      },
      {
        provide: UpdateAgendaEntryService,
        useFactory: (port: UpdateAgendaEntryPort) =>
          new UpdateAgendaEntryService(port),
        deps: [UpdateAgendaEntryPort],
      },
      {
        provide: UpdateAgendaEntrySeriesPort,
        useClass: HttpUpdateAgendaEntrySeriesAdapter,
      },
      {
        provide: UpdateAgendaEntrySeriesService,
        useFactory: (port: UpdateAgendaEntrySeriesPort) =>
          new UpdateAgendaEntrySeriesService(port),
        deps: [UpdateAgendaEntrySeriesPort],
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
      {
        provide: ChangeAgendaEntryStatusPort,
        useClass: HttpChangeAgendaEntryStatusAdapter,
      },
      {
        provide: ChangeAgendaEntryStatusService,
        useFactory: (port: ChangeAgendaEntryStatusPort) =>
          new ChangeAgendaEntryStatusService(port),
        deps: [ChangeAgendaEntryStatusPort],
      },
      {
        provide: DeleteAgendaEntryPort,
        useClass: HttpDeleteAgendaEntryAdapter,
      },
      {
        provide: DeleteAgendaEntryService,
        useFactory: (port: DeleteAgendaEntryPort) =>
          new DeleteAgendaEntryService(port),
        deps: [DeleteAgendaEntryPort],
      },
      {
        provide: DeleteAgendaEntrySeriesPort,
        useClass: HttpDeleteAgendaEntrySeriesAdapter,
      },
      {
        provide: DeleteAgendaEntrySeriesService,
        useFactory: (port: DeleteAgendaEntrySeriesPort) =>
          new DeleteAgendaEntrySeriesService(port),
        deps: [DeleteAgendaEntrySeriesPort],
      },
    ];
  }
}
