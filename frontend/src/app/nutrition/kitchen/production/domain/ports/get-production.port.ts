import { Observable } from "rxjs";
import { GetProductionResponse } from "../models/get-production-response.model";

export abstract class GetProductionPort {
  abstract getProduction(id: string): Observable<GetProductionResponse>;
}
