import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { ChoiceRowComponent } from "@shared/design-system/choice-row/infrastructure/components/choice-row.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ChoiceModalOption } from "../../domain/models/choice-modal-option.model";

@Component({
  selector: "ds-choice-modal",
  templateUrl: "./choice-modal.component.html",
  imports: [
    ButtonComponent,
    ChoiceRowComponent,
    ModalSheetComponent,
    NoteComponent,
    StackComponent,
    TextComponent,
  ],
})
export class ChoiceModalComponent {
  @Input() show = false;
  @Input() title = "";
  @Input() body = "";
  @Input() note = "";
  @Input() options: ChoiceModalOption[] = [];
  @Input() cancelLabel = "Cancel";
  @Input() busy = false;

  @Output() chosen = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  onDismiss(): void {
    if (this.busy) {
      return;
    }

    this.cancelled.emit();
  }
}
