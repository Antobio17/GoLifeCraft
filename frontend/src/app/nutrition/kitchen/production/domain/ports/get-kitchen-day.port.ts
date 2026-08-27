import { Observable } from "rxjs";
import { GetKitchenDayResponse } from "../models/get-kitchen-day-response.model";

export abstract class GetKitchenDayPort {
  abstract getKitchenDay(date: string): Observable<GetKitchenDayResponse>;
}
