import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateSessionDetailsPort } from "../../domain/ports/update-session-details.port";
import { UpdateSessionDetailsRequest } from "../../domain/models/update-session-details-request.model";

@Injectable()
export class HttpUpdateSessionDetailsAdapter extends UpdateSessionDetailsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/session";

  updateSessionDetails(
    sessionId: string,
    request: UpdateSessionDetailsRequest,
  ): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${sessionId}/details`,
      request,
    );
  }
}
