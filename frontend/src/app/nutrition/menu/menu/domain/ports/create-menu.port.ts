import { Observable } from "rxjs";
import { CreateMenuRequest } from "../models/write-menu.model";

export abstract class CreateMenuPort {
  abstract createMenu(request: CreateMenuRequest): Observable<void>;
}
