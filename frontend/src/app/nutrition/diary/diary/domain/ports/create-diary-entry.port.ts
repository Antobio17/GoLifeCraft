import { Observable } from "rxjs";
import { CreateDiaryEntryRequest } from "../models/create-diary-entry.model";

export abstract class CreateDiaryEntryPort {
  abstract createDiaryEntry(request: CreateDiaryEntryRequest): Observable<void>;
}
