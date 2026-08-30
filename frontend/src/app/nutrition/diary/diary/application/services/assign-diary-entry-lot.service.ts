import { Observable } from "rxjs";
import { AssignDiaryEntryLotPort } from "../../domain/ports/assign-diary-entry-lot.port";

export class AssignDiaryEntryLotService {
  constructor(private assignDiaryEntryLotPort: AssignDiaryEntryLotPort) {}

  assignDiaryEntryLot(
    diaryEntryId: string,
    productionItemId: string | null,
  ): Observable<void> {
    return this.assignDiaryEntryLotPort.assignDiaryEntryLot(diaryEntryId, {
      productionItemId,
    });
  }

  assignDiaryEntryNodeLot(
    diaryEntryId: string,
    nodePath: string,
    productionItemId: string | null,
  ): Observable<void> {
    return this.assignDiaryEntryLotPort.assignDiaryEntryNodeLot(
      diaryEntryId,
      nodePath,
      { productionItemId },
    );
  }
}
