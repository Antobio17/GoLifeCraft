import { Observable } from "rxjs";
import { GetTicketDraftPort } from "../../domain/ports/get-ticket-draft.port";
import { GetTicketDraftResponse } from "../../domain/models/get-ticket-draft-response.model";

export class GetTicketDraftService {
  constructor(private getTicketDraftPort: GetTicketDraftPort) {}

  getTicketDraft(photos: File[]): Observable<GetTicketDraftResponse> {
    return this.getTicketDraftPort.getTicketDraft(photos);
  }
}
