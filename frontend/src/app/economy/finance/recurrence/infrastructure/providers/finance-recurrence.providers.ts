import { Provider } from "@angular/core";
import { GetFinanceRecurrencesPort } from "@economy/finance/recurrence/domain/ports/get-finance-recurrences.port";
import { CreateFinanceRecurrencePort } from "@economy/finance/recurrence/domain/ports/create-finance-recurrence.port";
import { UpdateFinanceRecurrencePort } from "@economy/finance/recurrence/domain/ports/update-finance-recurrence.port";
import { DeleteFinanceRecurrencePort } from "@economy/finance/recurrence/domain/ports/delete-finance-recurrence.port";
import { HttpGetFinanceRecurrencesAdapter } from "@economy/finance/recurrence/infrastructure/adapters/http-get-finance-recurrences.adapter";
import { HttpCreateFinanceRecurrenceAdapter } from "@economy/finance/recurrence/infrastructure/adapters/http-create-finance-recurrence.adapter";
import { HttpUpdateFinanceRecurrenceAdapter } from "@economy/finance/recurrence/infrastructure/adapters/http-update-finance-recurrence.adapter";
import { HttpDeleteFinanceRecurrenceAdapter } from "@economy/finance/recurrence/infrastructure/adapters/http-delete-finance-recurrence.adapter";
import { GetFinanceRecurrencesService } from "@economy/finance/recurrence/application/services/get-finance-recurrences.service";
import { CreateFinanceRecurrenceService } from "@economy/finance/recurrence/application/services/create-finance-recurrence.service";
import { UpdateFinanceRecurrenceService } from "@economy/finance/recurrence/application/services/update-finance-recurrence.service";
import { DeleteFinanceRecurrenceService } from "@economy/finance/recurrence/application/services/delete-finance-recurrence.service";
import { FinanceRecurrenceFormService } from "@economy/finance/recurrence/application/services/finance-recurrence-form.service";

export class FinanceRecurrenceProviders {
  static getProviders(): Provider[] {
    return [
      FinanceRecurrenceFormService,
      {
        provide: GetFinanceRecurrencesPort,
        useClass: HttpGetFinanceRecurrencesAdapter,
      },
      {
        provide: GetFinanceRecurrencesService,
        useFactory: (port: GetFinanceRecurrencesPort) =>
          new GetFinanceRecurrencesService(port),
        deps: [GetFinanceRecurrencesPort],
      },
      {
        provide: CreateFinanceRecurrencePort,
        useClass: HttpCreateFinanceRecurrenceAdapter,
      },
      {
        provide: CreateFinanceRecurrenceService,
        useFactory: (port: CreateFinanceRecurrencePort) =>
          new CreateFinanceRecurrenceService(port),
        deps: [CreateFinanceRecurrencePort],
      },
      {
        provide: UpdateFinanceRecurrencePort,
        useClass: HttpUpdateFinanceRecurrenceAdapter,
      },
      {
        provide: UpdateFinanceRecurrenceService,
        useFactory: (port: UpdateFinanceRecurrencePort) =>
          new UpdateFinanceRecurrenceService(port),
        deps: [UpdateFinanceRecurrencePort],
      },
      {
        provide: DeleteFinanceRecurrencePort,
        useClass: HttpDeleteFinanceRecurrenceAdapter,
      },
      {
        provide: DeleteFinanceRecurrenceService,
        useFactory: (port: DeleteFinanceRecurrencePort) =>
          new DeleteFinanceRecurrenceService(port),
        deps: [DeleteFinanceRecurrencePort],
      },
    ];
  }
}
