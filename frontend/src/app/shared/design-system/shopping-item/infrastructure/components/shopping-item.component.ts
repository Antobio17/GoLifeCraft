import { Component, EventEmitter, Input, Output } from "@angular/core";
import { EmojiTileComponent } from "../../../emoji-tile/infrastructure/components/emoji-tile.component";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { SwipeToDeleteComponent } from "../../../swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { StackComponent } from "../../../stack/infrastructure/components/stack.component";
import { TextComponent } from "../../../text/infrastructure/components/text.component";
import { ChipComponent } from "../../../chip/infrastructure/components/chip.component";

@Component({
  selector: "ds-shopping-item",
  standalone: true,
  imports: [
    EmojiTileComponent,
    IconComponent,
    SwipeToDeleteComponent,
    StackComponent,
    TextComponent,
    ChipComponent,
  ],
  templateUrl: "./shopping-item.component.html",
  styleUrls: ["./shopping-item.component.css"],
})
export class ShoppingItemComponent {
  @Input() emoji = "";
  @Input() name = "";
  @Input() brand: string | null = null;
  @Input() store: string | null = null;
  @Input() priceLabel = "";
  @Input() quantity = 0;
  @Input() checked = false;
  @Input() canWrite = false;
  @Input() toggleAriaLabel = "";
  @Input() incrementLabel = "";
  @Input() decrementLabel = "";
  @Input() removeLabel = "";

  @Output() toggled = new EventEmitter<void>();
  @Output() increment = new EventEmitter<void>();
  @Output() decrement = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();
}
