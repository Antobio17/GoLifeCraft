import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { AssignDiaryEntryLotPort } from "../../domain/ports/assign-diary-entry-lot.port";
import { AssignDiaryEntryLotRequest } from "../../domain/models/assign-diary-entry-lot-request.model";

@Injectable()
export class HttpAssignDiaryEntryLotAdapter extends AssignDiaryEntryLotPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/diary";

  assignDiaryEntryLot(
    diaryEntryId: string,
    request: AssignDiaryEntryLotRequest,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${diaryEntryId}/lot`, request);
  }

  assignDiaryEntryNodeLot(
    diaryEntryId: string,
    nodePath: string,
    request: AssignDiaryEntryLotRequest,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${diaryEntryId}/nodes/${nodePath}/lot`,
      request,
    );
  }
}
