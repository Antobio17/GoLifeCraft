import { Component, Input } from "@angular/core";
import { CardComponent } from "../../../card/infrastructure/components/card.component";
import { StackComponent } from "../../../stack/infrastructure/components/stack.component";
import { HeadingComponent } from "../../../heading/infrastructure/components/heading.component";
import { TextComponent } from "../../../text/infrastructure/components/text.component";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { SetHeaderComponent } from "../../../set-header/infrastructure/components/set-header.component";

export interface WorkoutExerciseSet {
  reps: number;
  weight: number | null;
  done: boolean;
}

@Component({
  selector: "ds-workout-exercise",
  standalone: true,
  imports: [
    CardComponent,
    StackComponent,
    HeadingComponent,
    TextComponent,
    IconComponent,
    SetHeaderComponent,
  ],
  templateUrl: "./workout-exercise.component.html",
  styleUrls: ["./workout-exercise.component.css"],
})
export class WorkoutExerciseComponent {
  @Input() index = 0;
  @Input() name = "";
  @Input() muscle = "";
  @Input() ratio = "";
  @Input() note: string | null = null;
  @Input() sets: WorkoutExerciseSet[] = [];
  @Input() numLabel = "";
  @Input() repsLabel = "";
  @Input() weightLabel = "";
}
