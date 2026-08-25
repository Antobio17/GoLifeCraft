import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { EmojiTileComponent } from "../../../emoji-tile/infrastructure/components/emoji-tile.component";
import { ChipComponent } from "../../../chip/infrastructure/components/chip.component";
import { SwipeToDeleteComponent } from "../../../swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { StackComponent } from "../../../stack/infrastructure/components/stack.component";
import { TextComponent } from "../../../text/infrastructure/components/text.component";
import { PressableComponent } from "../../../pressable/infrastructure/components/pressable.component";
import { InlineQuantityComponent } from "../../../inline-quantity/infrastructure/components/inline-quantity.component";
import { MacroBadgesComponent } from "../../../macro-badges/infrastructure/components/macro-badges.component";
import { MacroBadge } from "../../../macro-badges/domain/models/macro-badge.model";
import { SelectOption } from "../../../select/domain/models/select-option.model";

type ChipTone = "neutral" | "brand" | "accent" | "warning";

@Component({
  selector: "ds-diary-entry",
  imports: [
    NgTemplateOutlet,
    EmojiTileComponent,
    ChipComponent,
    SwipeToDeleteComponent,
    StackComponent,
    TextComponent,
    PressableComponent,
    InlineQuantityComponent,
    MacroBadgesComponent,
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
  @Input() macros: MacroBadge[] = [];
  @Input() unit = "";
  @Input() unitValue = "";
  @Input() unitOptions: SelectOption[] = [];
  @Input() quantity = 0;
  @Input() quantityAriaLabel = "";
  @Input() unitAriaLabel = "";
  @Input() removeLabel = "";
  @Input() openable = false;
  @Input() openLabel = "";
  @Input() expandable = false;
  @Input() expanded = false;
  @Input() expandLabel = "";
  @Input() collapseLabel = "";

  @Output() quantityChange = new EventEmitter<number>();
  @Output() unitChange = new EventEmitter<string>();
  @Output() remove = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
  @Output() expandToggled = new EventEmitter<void>();

  get pressable(): boolean {
    return this.expandable || this.openable;
  }

  get pressLabel(): string {
    if (!this.expandable) {
      return this.openLabel;
    }

    return this.expanded ? this.collapseLabel : this.expandLabel;
  }

  onPress(): void {
    if (this.expandable) {
      this.expandToggled.emit();
      return;
    }

    this.opened.emit();
  }
}
