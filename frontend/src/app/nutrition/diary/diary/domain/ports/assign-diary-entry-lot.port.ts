import { Observable } from "rxjs";
import { AssignDiaryEntryLotRequest } from "../models/assign-diary-entry-lot-request.model";

export abstract class AssignDiaryEntryLotPort {
  abstract assignDiaryEntryLot(
    diaryEntryId: string,
    request: AssignDiaryEntryLotRequest,
  ): Observable<void>;

  abstract assignDiaryEntryNodeLot(
    diaryEntryId: string,
    nodePath: string,
    request: AssignDiaryEntryLotRequest,
  ): Observable<void>;
}
