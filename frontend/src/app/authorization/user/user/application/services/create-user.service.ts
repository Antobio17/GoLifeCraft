import { Observable } from "rxjs";
import { CreateUserPort } from "../../domain/ports/create-user.port";
import { CreateUserRequest } from "../../domain/models/create-user.model";

export class CreateUserService {
  constructor(private createUserPort: CreateUserPort) {}

  createUser(request: CreateUserRequest): Observable<void> {
    return this.createUserPort.createUser(request);
  }
}
