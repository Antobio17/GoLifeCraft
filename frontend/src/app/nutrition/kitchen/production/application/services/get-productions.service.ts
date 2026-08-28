import { Observable } from "rxjs";
import { GetProductionsPort } from "../../domain/ports/get-productions.port";
import { GetProductionsResponse } from "../../domain/models/get-productions-response.model";

export class GetProductionsService {
  constructor(private getProductionsPort: GetProductionsPort) {}

  getProductions(
    page: number = 1,
    pageSize: number = 20,
  ): Observable<GetProductionsResponse> {
    return this.getProductionsPort.getProductions(page, pageSize);
  }
}
