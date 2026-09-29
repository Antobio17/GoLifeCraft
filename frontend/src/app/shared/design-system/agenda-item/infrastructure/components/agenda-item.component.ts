import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { StackComponent } from "../../../stack/infrastructure/components/stack.component";
import { TextComponent } from "../../../text/infrastructure/components/text.component";
import { ChipComponent } from "../../../chip/infrastructure/components/chip.component";
import { PressableComponent } from "../../../pressable/infrastructure/components/pressable.component";
import { GlyphComponent } from "../../../glyph/infrastructure/components/glyph.component";
import { DsGlyph } from "../../../glyph/domain/models/ds-glyph.enum";
import { SwipeToDeleteComponent } from "../../../swipe-to-delete/infrastructure/components/swipe-to-delete.component";

@Component({
  selector: "ds-agenda-item",
  imports: [
    IconComponent,
    StackComponent,
    TextComponent,
    ChipComponent,
    PressableComponent,
    SwipeToDeleteComponent,
    GlyphComponent,
  ],
  templateUrl: "./agenda-item.component.html",
  styleUrls: ["./agenda-item.component.css"],
})
export class AgendaItemComponent {
  @Input() title = "";
  @Input() kindLabel = "";
  @Input() glyph: `${DsGlyph}` | null = null;
  @Input() appointment = false;
  @Input() timeLabel = "";
  @Input() notes = "";
  @Input() done = false;
  @Input() removable = true;
  @Input() checkable = true;
  @Input() toggleLabel = "";
  @Input() editLabel = "";
  @Input() removeLabel = "";

  @Output() toggled = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
  @Output() removed = new EventEmitter<void>();
}
