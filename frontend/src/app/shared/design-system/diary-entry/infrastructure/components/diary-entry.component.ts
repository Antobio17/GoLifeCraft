import { Component, EventEmitter, Input, Output } from "@angular/core";
import { EmojiTileComponent } from "../../../emoji-tile/infrastructure/components/emoji-tile.component";
import { ChipComponent } from "../../../chip/infrastructure/components/chip.component";
import { SwipeToDeleteComponent } from "../../../swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { StackComponent } from "../../../stack/infrastructure/components/stack.component";
import { TextComponent } from "../../../text/infrastructure/components/text.component";
import { PressableComponent } from "../../../pressable/infrastructure/components/pressable.component";
import { InlineQuantityComponent } from "../../../inline-quantity/infrastructure/components/inline-quantity.component";

type ChipTone = "neutral" | "brand" | "accent" | "warning";

@Component({
  selector: "ds-diary-entry",
  standalone: true,
  imports: [
    EmojiTileComponent,
    ChipComponent,
    SwipeToDeleteComponent,
    StackComponent,
    TextComponent,
    PressableComponent,
    InlineQuantityComponent,
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
  @Input() quantityAriaLabel = "";
  @Input() removeLabel = "";
  @Input() openable = false;
  @Input() openLabel = "";

  @Output() quantityChange = new EventEmitter<number>();
  @Output() remove = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
}
