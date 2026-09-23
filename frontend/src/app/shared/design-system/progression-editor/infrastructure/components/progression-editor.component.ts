import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NumberInputComponent } from "../../../number-input/infrastructure/components/number-input.component";
import { SelectComponent } from "../../../select/infrastructure/components/select.component";
import { SelectOption } from "../../../select/domain/models/select-option.model";
import { TextComponent } from "../../../text/infrastructure/components/text.component";
import { StackComponent } from "../../../stack/infrastructure/components/stack.component";

export interface ProgressionTargetRow {
  index: number;
  label: string;
  now: number;
  reps: number;
}

@Component({
  selector: "ds-progression-editor",
  imports: [
    FormsModule,
    NumberInputComponent,
    SelectComponent,
    TextComponent,
    StackComponent,
  ],
  templateUrl: "./progression-editor.component.html",
  styleUrls: ["./progression-editor.component.css"],
})
export class ProgressionEditorComponent {
  @Input() modeLabel = "";
  @Input() modeOptions: SelectOption[] = [];
  @Input() mode = "none";
  @Input() modeHint = "";

  @Input() configured = false;
  @Input() setLabel = "";
  @Input() nowLabel = "";
  @Input() targetLabel = "";
  @Input() targets: ProgressionTargetRow[] = [];
  @Input() toleranceLabel = "";
  @Input() tolerance = 2;
  @Input() incrementLabel = "";
  @Input() increment = 1.25;
  @Input() noTargetsText = "";

  @Output() modeChange = new EventEmitter<string>();
  @Output() targetChange = new EventEmitter<ProgressionTargetRow>();
  @Output() toleranceChange = new EventEmitter<number>();
  @Output() incrementChange = new EventEmitter<number>();

  onTargetChange(row: ProgressionTargetRow, reps: number): void {
    this.targetChange.emit({ ...row, reps });
  }
}
