import { Observable } from "rxjs";
import { GetSessionsPort } from "../../domain/ports/get-sessions.port";
import { GetSessionsResponse } from "../../domain/models/get-sessions-response.model";

export class GetSessionsService {
  constructor(private getSessionsPort: GetSessionsPort) {}

  getSessions(
    page: number = 1,
    pageSize: number = 10,
    filterName?: string,
  ): Observable<GetSessionsResponse> {
    return this.getSessionsPort.getSessions(page, pageSize, filterName);
  }
}
