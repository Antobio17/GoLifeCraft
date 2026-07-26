import { Provider } from "@angular/core";
import { CreateAgendaEntryPort } from "@agenda/agenda/agenda/domain/ports/create-agenda-entry.port";
import { UpdateAgendaEntryPort } from "@agenda/agenda/agenda/domain/ports/update-agenda-entry.port";
import { ChangeAgendaEntryStatusPort } from "@agenda/agenda/agenda/domain/ports/change-agenda-entry-status.port";
import { DeleteAgendaEntryPort } from "@agenda/agenda/agenda/domain/ports/delete-agenda-entry.port";
import { HttpCreateAgendaEntryAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-create-agenda-entry.adapter";
import { HttpUpdateAgendaEntryAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-update-agenda-entry.adapter";
import { HttpChangeAgendaEntryStatusAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-change-agenda-entry-status.adapter";
import { HttpDeleteAgendaEntryAdapter } from "@agenda/agenda/agenda/infrastructure/adapters/http-delete-agenda-entry.adapter";
import { CreateAgendaEntryService } from "@agenda/agenda/agenda/application/services/create-agenda-entry.service";
import { UpdateAgendaEntryService } from "@agenda/agenda/agenda/application/services/update-agenda-entry.service";
import { ChangeAgendaEntryStatusService } from "@agenda/agenda/agenda/application/services/change-agenda-entry-status.service";
import { DeleteAgendaEntryService } from "@agenda/agenda/agenda/application/services/delete-agenda-entry.service";
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
    ];
  }
}
