import { Observable } from "rxjs";
import { GetProductionsResponse } from "../models/get-productions-response.model";

export abstract class GetProductionsPort {
  abstract getProductions(
    page: number,
    pageSize: number,
  ): Observable<GetProductionsResponse>;
}
