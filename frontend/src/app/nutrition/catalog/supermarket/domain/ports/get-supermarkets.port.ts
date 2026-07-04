import { Observable } from "rxjs";
import { GetSupermarketsResponse } from "../models/get-supermarkets-response.model";

export abstract class GetSupermarketsPort {
  abstract getSupermarkets(
    page?: number,
    pageSize?: number,
    filterName?: string,
  ): Observable<GetSupermarketsResponse>;
}
