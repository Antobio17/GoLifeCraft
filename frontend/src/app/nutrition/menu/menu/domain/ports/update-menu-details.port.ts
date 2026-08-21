import { Observable } from "rxjs";
import { UpdateMenuDetailsRequest } from "../models/update-menu-details-request.model";

export abstract class UpdateMenuDetailsPort {
  abstract updateMenuDetails(
    menuId: string,
    request: UpdateMenuDetailsRequest,
  ): Observable<void>;
}
