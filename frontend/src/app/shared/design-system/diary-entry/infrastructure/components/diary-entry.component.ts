import { Component, EventEmitter, Input, Output } from "@angular/core";
import { EmojiTileComponent } from "../../../emoji-tile/infrastructure/components/emoji-tile.component";
import { ChipComponent } from "../../../chip/infrastructure/components/chip.component";
import { SwipeToDeleteComponent } from "../../../swipe-to-delete/infrastructure/components/swipe-to-delete.component";

type ChipTone = "neutral" | "brand" | "accent" | "warning";

@Component({
  selector: "ds-diary-entry",
  standalone: true,
  imports: [EmojiTileComponent, ChipComponent, SwipeToDeleteComponent],
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

  @Output() quantityChange = new EventEmitter<number>();
  @Output() remove = new EventEmitter<void>();

  onQtyCommit(event: Event): void {
    const input = event.target as HTMLInputElement;
    const parsed = Number.parseFloat(input.value.replace(",", "."));

    if (!Number.isFinite(parsed) || parsed <= 0) {
      input.value = String(this.quantity);

      return;
    }

    if (parsed === this.quantity) return;

    this.quantityChange.emit(parsed);
  }

  onQtyEnter(event: Event): void {
    (event.target as HTMLInputElement).blur();
  }
}
