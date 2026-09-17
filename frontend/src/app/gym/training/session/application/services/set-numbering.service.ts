import { Injectable } from "@angular/core";
import { ExerciseSetView } from "../../domain/models/session-detail.model";
import { SetKind } from "../../domain/models/set-kind.model";
import { SetRowView } from "../../domain/models/set-row-view.model";

@Injectable({ providedIn: "root" })
export class SetNumberingService {
  rows<T extends ExerciseSetView>(sets: T[]): SetRowView<T>[] {
    let warmups = 0;
    let effectives = 0;

    return sets.map((set) => {
      if (set.kind === SetKind.Warmup) {
        warmups += 1;
        return { ...set, warmup: true, displayLabel: `A${warmups}` };
      }

      effectives += 1;
      return { ...set, warmup: false, displayLabel: `${effectives}` };
    });
  }
}
