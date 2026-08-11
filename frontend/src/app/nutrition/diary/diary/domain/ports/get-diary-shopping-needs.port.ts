import { Observable } from "rxjs";
import { GetDiaryShoppingNeedsResponse } from "../models/get-diary-shopping-needs-response.model";

export abstract class GetDiaryShoppingNeedsPort {
  abstract getDiaryShoppingNeeds(
    fromDate: string,
    toDate: string,
  ): Observable<GetDiaryShoppingNeedsResponse>;
}
