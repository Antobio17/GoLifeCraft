import {
  Component,
  EventEmitter,
  Output,
  computed,
  input,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { StackComponent } from "../../../stack/infrastructure/components/stack.component";
import { TextComponent } from "../../../text/infrastructure/components/text.component";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { ButtonComponent } from "../../../button/infrastructure/components/button.component";
import { PressableComponent } from "../../../pressable/infrastructure/components/pressable.component";
import { EmojiTileComponent } from "../../../emoji-tile/infrastructure/components/emoji-tile.component";
import { DividerComponent } from "../../../divider/infrastructure/components/divider.component";
import { InlineQuantityComponent } from "../../../inline-quantity/infrastructure/components/inline-quantity.component";
import { SwipeToDeleteComponent } from "../../../swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { DiaryTreeRow } from "../../domain/models/diary-tree-row.model";
import {
  DiaryTreeQuantityChange,
  DiaryTreeUnitChange,
} from "../../domain/models/diary-tree-change.model";

const INDENT_PER_LEVEL_REM = 0.9375;

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
    DividerComponent,
    InlineQuantityComponent,
    SwipeToDeleteComponent,
  ],
  templateUrl: "./diary-tree.component.html",
  styleUrls: ["./diary-tree.component.css"],
})
export class DiaryTreeComponent {
  rows = input<DiaryTreeRow[]>([]);
  title = input("");
  showReset = input(false);
  resetMessage = input("");
  resetLabel = input("");
  expandLabel = input("");
  collapseLabel = input("");
  openLabel = input("");
  quantityAriaLabel = input("");
  unitAriaLabel = input("");
  removeLabel = input("");

  @Output() toggled = new EventEmitter<string>();
  @Output() opened = new EventEmitter<string>();
  @Output() quantityChanged = new EventEmitter<DiaryTreeQuantityChange>();
  @Output() unitChanged = new EventEmitter<DiaryTreeUnitChange>();
  @Output() restored = new EventEmitter<void>();
  @Output() lotPicked = new EventEmitter<string>();
  @Output() removed = new EventEmitter<string>();

  viewRows = computed(() =>
    this.rows().map((row) => ({
      ...row,
      indent: `${row.depth * INDENT_PER_LEVEL_REM}rem`,
      macrosLabel: row.macros
        .filter((macro) => !!macro.value)
        .map((macro) => `${macro.label} ${macro.value}`)
        .join(" · "),
    })),
  );
}
