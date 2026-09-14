import { Observable } from "rxjs";
import { DeleteDiaryEntryNodePort } from "../../domain/ports/delete-diary-entry-node.port";

export class DeleteDiaryEntryNodeService {
  constructor(private deleteDiaryEntryNodePort: DeleteDiaryEntryNodePort) {}

  deleteDiaryEntryNode(id: string, path: string): Observable<void> {
    return this.deleteDiaryEntryNodePort.deleteDiaryEntryNode(id, path);
  }
}
