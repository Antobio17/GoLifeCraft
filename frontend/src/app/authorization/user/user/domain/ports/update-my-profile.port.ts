import { Observable } from "rxjs";
import { UpdateMyProfileRequest } from "../models/update-my-profile-request.model";

export abstract class UpdateMyProfilePort {
  abstract updateMyProfile(request: UpdateMyProfileRequest): Observable<void>;
}
