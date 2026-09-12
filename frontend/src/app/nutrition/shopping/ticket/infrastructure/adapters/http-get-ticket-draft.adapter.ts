import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetTicketDraftPort } from "../../domain/ports/get-ticket-draft.port";
import { GetTicketDraftResponse } from "../../domain/models/get-ticket-draft-response.model";

@Injectable()
export class HttpGetTicketDraftAdapter extends GetTicketDraftPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/shopping/tickets/draft";

  getTicketDraft(photos: File[]): Observable<GetTicketDraftResponse> {
    const formData = new FormData();
    photos.forEach((photo) => formData.append("photos[]", photo, photo.name));

    return this.http.post<GetTicketDraftResponse>(this.apiUrl, formData);
  }
}
