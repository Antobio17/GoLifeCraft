import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NumberInputComponent } from "../../../number-input/infrastructure/components/number-input.component";
import {
  SegmentedOption,
  SegmentedToggleComponent,
} from "../../../segmented-toggle/infrastructure/components/segmented-toggle.component";
import { TextComponent } from "../../../text/infrastructure/components/text.component";
import { StackComponent } from "../../../stack/infrastructure/components/stack.component";
import { HeadingComponent } from "../../../heading/infrastructure/components/heading.component";

export interface ProgressionTargetRow {
  index: number;
  label: string;
  reps: number;
}

@Component({
  selector: "ds-progression-editor",
  imports: [
    FormsModule,
    NumberInputComponent,
    SegmentedToggleComponent,
    TextComponent,
    StackComponent,
    HeadingComponent,
  ],
  templateUrl: "./progression-editor.component.html",
  styleUrls: ["./progression-editor.component.css"],
})
export class ProgressionEditorComponent {
  @Input() modeLabel = "";
  @Input() modeOptions: SegmentedOption[] = [];
  @Input() mode = "none";
  @Input() modeHint = "";

  @Input() configured = false;
  @Input() targetsLabel = "";
  @Input() targets: ProgressionTargetRow[] = [];
  @Input() toleranceLabel = "";
  @Input() tolerance = 2;
  @Input() incrementLabel = "";
  @Input() increment = 2.5;
  @Input() noTargetsText = "";

  @Output() modeChange = new EventEmitter<string>();
  @Output() targetChange = new EventEmitter<ProgressionTargetRow>();
  @Output() toleranceChange = new EventEmitter<number>();
  @Output() incrementChange = new EventEmitter<number>();

  onTargetChange(row: ProgressionTargetRow, reps: number): void {
    this.targetChange.emit({ ...row, reps });
  }
}
