import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { StackComponent } from "../../../stack/infrastructure/components/stack.component";
import { TextComponent } from "../../../text/infrastructure/components/text.component";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { ButtonComponent } from "../../../button/infrastructure/components/button.component";
import { PressableComponent } from "../../../pressable/infrastructure/components/pressable.component";
import { EmojiTileComponent } from "../../../emoji-tile/infrastructure/components/emoji-tile.component";
import { MacroBadgesComponent } from "../../../macro-badges/infrastructure/components/macro-badges.component";
import { InlineQuantityComponent } from "../../../inline-quantity/infrastructure/components/inline-quantity.component";
import { DiaryTreeRow } from "../../domain/models/diary-tree-row.model";
import {
  DiaryTreeQuantityChange,
  DiaryTreeUnitChange,
} from "../../domain/models/diary-tree-change.model";

const INDENT_PER_LEVEL = 15;

@Component({
  selector: "ds-diary-tree",
  imports: [
    NgTemplateOutlet,
    StackComponent,
    TextComponent,
    IconComponent,
    ButtonComponent,
    PressableComponent,
    EmojiTileComponent,
    MacroBadgesComponent,
    InlineQuantityComponent,
  ],
  templateUrl: "./diary-tree.component.html",
  styleUrls: ["./diary-tree.component.css"],
})
export class DiaryTreeComponent {
  @Input() rows: DiaryTreeRow[] = [];
  @Input() title = "";
  @Input() canWrite = false;
  @Input() showReset = false;
  @Input() resetMessage = "";
  @Input() resetLabel = "";
  @Input() expandLabel = "";
  @Input() collapseLabel = "";
  @Input() quantityAriaLabel = "";
  @Input() unitAriaLabel = "";

  @Output() toggled = new EventEmitter<string>();
  @Output() quantityChanged = new EventEmitter<DiaryTreeQuantityChange>();
  @Output() unitChanged = new EventEmitter<DiaryTreeUnitChange>();
  @Output() restored = new EventEmitter<void>();

  indentOf(row: DiaryTreeRow): string {
    return `${row.depth * INDENT_PER_LEVEL}px`;
  }
}
