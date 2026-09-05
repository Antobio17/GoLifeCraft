import { Observable } from "rxjs";
import { GetInventoriesResponse } from "../models/get-inventories-response.model";

export abstract class GetInventoriesPort {
  abstract getInventories(
    page?: number,
    pageSize?: number,
    filterShift?: string,
    filterStatus?: string,
  ): Observable<GetInventoriesResponse>;
}
