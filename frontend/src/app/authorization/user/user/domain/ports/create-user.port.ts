import { Observable } from "rxjs";
import { CreateUserRequest } from "../models/create-user.model";

export abstract class CreateUserPort {
  abstract createUser(request: CreateUserRequest): Observable<void>;
}
