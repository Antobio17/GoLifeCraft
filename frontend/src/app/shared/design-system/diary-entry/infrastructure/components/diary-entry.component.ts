import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { EmojiTileComponent } from "../../../emoji-tile/infrastructure/components/emoji-tile.component";
import { SwipeToDeleteComponent } from "../../../swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { StackComponent } from "../../../stack/infrastructure/components/stack.component";
import { TextComponent } from "../../../text/infrastructure/components/text.component";
import { PressableComponent } from "../../../pressable/infrastructure/components/pressable.component";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

type DiaryEntryStatusTone = "" | "ok" | "warn";

@Component({
  selector: "ds-diary-entry",
  imports: [
    NgTemplateOutlet,
    EmojiTileComponent,
    SwipeToDeleteComponent,
    StackComponent,
    TextComponent,
    PressableComponent,
    IconComponent,
  ],
  templateUrl: "./diary-entry.component.html",
  styleUrls: ["./diary-entry.component.css"],
})
export class DiaryEntryComponent {
  @Input() emoji = "";
  @Input() imageUrl: string | null = null;
  @Input() name = "";
  @Input() kindIcon: DsIconName | null = null;
  @Input() kindLabel = "";
  @Input() statusTone: DiaryEntryStatusTone = "";
  @Input() statusLabel = "";
  @Input() kcalLabel = "";
  @Input() macrosLabel = "";
  @Input() quantityLabel = "";
  @Input() quantityAriaLabel = "";
  @Input() removeLabel = "";
  @Input() openable = false;
  @Input() openLabel = "";
  @Input() expandable = false;
  @Input() expanded = false;
  @Input() expandLabel = "";
  @Input() collapseLabel = "";
  @Input() compact = false;

  @Output() quantityPressed = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
  @Output() expandToggled = new EventEmitter<void>();
}
