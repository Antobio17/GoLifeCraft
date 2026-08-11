import { Observable } from "rxjs";
import { GetDiaryShoppingNeedsPort } from "@nutrition/diary/diary/domain/ports/get-diary-shopping-needs.port";
import { GetDiaryShoppingNeedsResponse } from "@nutrition/diary/diary/domain/models/get-diary-shopping-needs-response.model";

export class GetDiaryShoppingNeedsService {
  constructor(private getDiaryShoppingNeedsPort: GetDiaryShoppingNeedsPort) {}

  getDiaryShoppingNeeds(
    fromDate: string,
    toDate: string,
  ): Observable<GetDiaryShoppingNeedsResponse> {
    return this.getDiaryShoppingNeedsPort.getDiaryShoppingNeeds(
      fromDate,
      toDate,
    );
  }
}
