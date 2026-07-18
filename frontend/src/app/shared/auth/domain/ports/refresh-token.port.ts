import { Observable } from "rxjs";
import { RefreshTokenResponse } from "../models/refresh-token-response.model";

export abstract class RefreshTokenPort {
  abstract refresh(refreshToken: string): Observable<RefreshTokenResponse>;
}
