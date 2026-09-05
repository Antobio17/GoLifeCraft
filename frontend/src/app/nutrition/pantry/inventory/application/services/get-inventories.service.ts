import { Observable } from "rxjs";
import { GetInventoriesPort } from "../../domain/ports/get-inventories.port";
import { GetInventoriesResponse } from "../../domain/models/get-inventories-response.model";

export class GetInventoriesService {
  constructor(private getInventoriesPort: GetInventoriesPort) {}

  getInventories(
    page: number = 1,
    pageSize: number = 20,
    filterShift?: string,
    filterStatus?: string,
  ): Observable<GetInventoriesResponse> {
    return this.getInventoriesPort.getInventories(
      page,
      pageSize,
      filterShift,
      filterStatus,
    );
  }
}
