import { Observable } from "rxjs";
import { GetMyProfileResponse } from "../models/get-my-profile-response.model";

export abstract class GetMyProfilePort {
  abstract getMyProfile(): Observable<GetMyProfileResponse>;
}
