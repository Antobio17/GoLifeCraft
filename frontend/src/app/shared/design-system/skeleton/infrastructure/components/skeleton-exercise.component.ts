import { Component, Input } from "@angular/core";

export type SkeletonExerciseVariant = "editable" | "readonly";

@Component({
  selector: "ds-skeleton-exercise",
  templateUrl: "./skeleton-exercise.component.html",
  styleUrls: ["./skeleton-exercise.component.css"],
  host: {
    "[style.--skex-padding]": "padding",
    "[style.--skex-name]": "nameWidth",
    "[style.--skex-badge]": "badge",
    "[style.--skex-note]": "noteHeight",
    "[style.--ds-sk-delay]": "delay",
  },
})
export class SkeletonExerciseComponent {
  @Input() variant: SkeletonExerciseVariant = "editable";
  @Input() padding = "var(--ds-space-3)";
  @Input() nameWidth = "54%";
  @Input() badge = "";
  @Input() action = false;
  @Input() note = false;
  @Input() noteHeight = "2.875rem";
  @Input() sets = 3;
  @Input() doneCol = false;
  @Input() addTile = false;
  @Input() delay = "0s";

  get setArray(): number[] {
    return Array.from({ length: this.sets }, (_, index) => index);
  }

  delayFor(index: number): string {
    return `${index * 0.05}s`;
  }
}
