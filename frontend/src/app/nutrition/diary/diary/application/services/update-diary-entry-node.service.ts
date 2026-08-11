import { Observable } from "rxjs";
import { UpdateDiaryEntryNodePort } from "../../domain/ports/update-diary-entry-node.port";

export class UpdateDiaryEntryNodeService {
  constructor(private updateDiaryEntryNodePort: UpdateDiaryEntryNodePort) {}

  updateDiaryEntryNode(
    id: string,
    path: string,
    quantity: number,
    unit?: string,
  ): Observable<void> {
    return this.updateDiaryEntryNodePort.updateDiaryEntryNode(
      id,
      path,
      quantity,
      unit,
    );
  }
}
