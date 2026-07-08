import { Observable } from "rxjs";
import { GetSessionsResponse } from "../models/get-sessions-response.model";

export abstract class GetSessionsPort {
  abstract getSessions(
    page?: number,
    pageSize?: number,
    filterName?: string,
  ): Observable<GetSessionsResponse>;
}
