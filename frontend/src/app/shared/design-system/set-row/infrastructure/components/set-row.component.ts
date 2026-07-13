import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { NumberInputComponent } from "../../../number-input/infrastructure/components/number-input.component";

@Component({
  selector: "ds-set-row",
  standalone: true,
  imports: [FormsModule, IconComponent, NumberInputComponent],
  templateUrl: "./set-row.component.html",
  styleUrls: ["./set-row.component.css"],
})
export class SetRowComponent {
  @Input() displayIndex = 0;
  @Input() reps = 0;
  @Input() weight = 0;
  @Input() done = false;
  @Input() swiped = false;
  @Input() showCheck = false;

  @Input() repsAriaLabel = "";
  @Input() weightAriaLabel = "";
  @Input() repsUpLabel = "";
  @Input() repsDownLabel = "";
  @Input() weightUpLabel = "";
  @Input() weightDownLabel = "";
  @Input() removeLabel = "";
  @Input() markDoneLabel = "";

  @Output() repsChange = new EventEmitter<number>();
  @Output() weightChange = new EventEmitter<number>();
  @Output() toggleDone = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();
  @Output() swipeStart = new EventEmitter<TouchEvent>();
  @Output() swipeEnd = new EventEmitter<TouchEvent>();
}
