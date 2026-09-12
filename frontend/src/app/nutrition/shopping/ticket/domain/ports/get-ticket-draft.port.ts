import { Observable } from "rxjs";
import { GetTicketDraftResponse } from "../models/get-ticket-draft-response.model";

export abstract class GetTicketDraftPort {
  abstract getTicketDraft(photos: File[]): Observable<GetTicketDraftResponse>;
}
