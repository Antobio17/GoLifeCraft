import { Observable } from "rxjs";
import { Theme } from "../models/theme.model";

export abstract class UpdateThemePort {
  abstract update(theme: Theme): Observable<void>;
}
