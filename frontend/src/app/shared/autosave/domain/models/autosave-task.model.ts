import { Observable } from "rxjs";

export type AutosaveTask = () => Observable<unknown>;
