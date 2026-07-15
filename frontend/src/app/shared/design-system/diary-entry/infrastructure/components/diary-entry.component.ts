import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { EmojiTileComponent } from "../../../emoji-tile/infrastructure/components/emoji-tile.component";
import { ChipComponent } from "../../../chip/infrastructure/components/chip.component";
import { FieldComponent } from "../../../field/infrastructure/components/field.component";
import { NumberInputComponent } from "../../../number-input/infrastructure/components/number-input.component";

type ChipTone = "neutral" | "brand" | "accent" | "warning";

@Component({
  selector: "ds-diary-entry",
  standalone: true,
  imports: [
    FormsModule,
    IconComponent,
    EmojiTileComponent,
    ChipComponent,
    FieldComponent,
    NumberInputComponent,
  ],
  templateUrl: "./diary-entry.component.html",
  styleUrls: ["./diary-entry.component.css"],
})
export class DiaryEntryComponent {
  @Input() emoji = "";
  @Input() name = "";
  @Input() badge = "";
  @Input() badgeTone: ChipTone = "neutral";
  @Input() kcalLabel = "";
  @Input() unit = "";
  @Input() quantity = 0;
  @Input() quantityLabel = "";
  @Input() canWrite = false;
  @Input() swiped = false;

  @Input() quantityAriaLabel = "";
  @Input() removeLabel = "";

  @Output() quantityChange = new EventEmitter<number>();
  @Output() remove = new EventEmitter<void>();
  @Output() swipeStart = new EventEmitter<TouchEvent>();
  @Output() swipeEnd = new EventEmitter<TouchEvent>();
}
