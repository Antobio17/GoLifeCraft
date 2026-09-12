import { TicketDraft } from "./ticket-draft.model";

export interface GetTicketDraftResponse {
  data: {
    fromCache: boolean;
    draft: TicketDraft | null;
    lowConfidenceFields: string[];
    notes: string[];
  };
}
