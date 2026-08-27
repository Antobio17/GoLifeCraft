import { Observable } from "rxjs";
import { GetKitchenDayPort } from "../../domain/ports/get-kitchen-day.port";
import { GetKitchenDayResponse } from "../../domain/models/get-kitchen-day-response.model";

export class GetKitchenDayService {
  constructor(private getKitchenDayPort: GetKitchenDayPort) {}

  getKitchenDay(date: string): Observable<GetKitchenDayResponse> {
    return this.getKitchenDayPort.getKitchenDay(date);
  }
}
