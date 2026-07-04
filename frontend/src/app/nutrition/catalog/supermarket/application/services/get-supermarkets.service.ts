import { Observable } from "rxjs";
import { GetSupermarketsPort } from "../../domain/ports/get-supermarkets.port";
import { GetSupermarketsResponse } from "../../domain/models/get-supermarkets-response.model";

export class GetSupermarketsService {
  constructor(private getSupermarketsPort: GetSupermarketsPort) {}

  getSupermarkets(
    page: number = 1,
    pageSize: number = 10,
    filterName?: string,
  ): Observable<GetSupermarketsResponse> {
    return this.getSupermarketsPort.getSupermarkets(page, pageSize, filterName);
  }
}
