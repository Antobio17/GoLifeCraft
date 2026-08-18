import { Observable } from "rxjs";
import { GetFinanceRecurrencesPort } from "../../domain/ports/get-finance-recurrences.port";
import { GetFinanceRecurrencesResponse } from "../../domain/models/get-finance-recurrences-response.model";

export class GetFinanceRecurrencesService {
  constructor(private getFinanceRecurrencesPort: GetFinanceRecurrencesPort) {}

  getFinanceRecurrences(): Observable<GetFinanceRecurrencesResponse> {
    return this.getFinanceRecurrencesPort.getFinanceRecurrences();
  }
}
