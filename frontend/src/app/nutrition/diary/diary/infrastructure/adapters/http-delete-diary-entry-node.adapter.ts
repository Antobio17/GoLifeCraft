import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DeleteDiaryEntryNodePort } from "../../domain/ports/delete-diary-entry-node.port";

@Injectable()
export class HttpDeleteDiaryEntryNodeAdapter extends DeleteDiaryEntryNodePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/diary";

  deleteDiaryEntryNode(id: string, path: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/nodes/${path}`);
  }
}
