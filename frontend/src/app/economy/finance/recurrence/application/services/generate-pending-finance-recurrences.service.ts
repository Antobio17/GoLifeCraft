import { Observable } from "rxjs";
import { GeneratePendingFinanceRecurrencesPort } from "../../domain/ports/generate-pending-finance-recurrences.port";
import { GeneratePendingFinanceRecurrencesResponse } from "../../domain/models/generate-pending-finance-recurrences-response.model";

export class GeneratePendingFinanceRecurrencesService {
  constructor(
    private generatePendingFinanceRecurrencesPort: GeneratePendingFinanceRecurrencesPort,
  ) {}

  generatePendingFinanceRecurrences(): Observable<GeneratePendingFinanceRecurrencesResponse> {
    return this.generatePendingFinanceRecurrencesPort.generatePendingFinanceRecurrences();
  }
}
