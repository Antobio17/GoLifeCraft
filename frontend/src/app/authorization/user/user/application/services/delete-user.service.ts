import { Observable } from "rxjs";
import { DeleteUserPort } from "../../domain/ports/delete-user.port";

export class DeleteUserService {
  constructor(private deleteUserPort: DeleteUserPort) {}

  deleteUser(userId: string): Observable<void> {
    return this.deleteUserPort.deleteUser(userId);
  }
}
