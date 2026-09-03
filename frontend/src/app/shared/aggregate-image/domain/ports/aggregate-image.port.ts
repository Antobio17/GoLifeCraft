import { Observable } from "rxjs";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";

export abstract class AggregateImagePort {
  abstract download(
    kind: AggregateImageKind,
    id: string,
    image: string,
  ): Observable<Blob>;

  abstract upload(
    kind: AggregateImageKind,
    id: string,
    file: File,
  ): Observable<void>;

  abstract remove(kind: AggregateImageKind, id: string): Observable<void>;
}
