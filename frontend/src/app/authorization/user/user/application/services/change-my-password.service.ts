import { Observable } from "rxjs";
import { ChangeMyPasswordPort } from "../../domain/ports/change-my-password.port";
import { ChangeMyPasswordRequest } from "../../domain/models/change-my-password-request.model";

export class ChangeMyPasswordService {
  constructor(private port: ChangeMyPasswordPort) {}

  changeMyPassword(request: ChangeMyPasswordRequest): Observable<void> {
    return this.port.changeMyPassword(request);
  }
}
