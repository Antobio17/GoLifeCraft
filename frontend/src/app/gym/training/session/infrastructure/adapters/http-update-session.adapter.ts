import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateSessionPort } from "../../domain/ports/update-session.port";
import { UpdateSessionRequest } from "../../domain/models/session-request.model";

@Injectable()
export class HttpUpdateSessionAdapter extends UpdateSessionPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/session";

  updateSession(id: string, request: UpdateSessionRequest): Observable<void> {
    return this.http.put<void>(this.apiUrl + "/" + id, request);
  }
}
