import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { ButtonVariant } from "@shared/design-system/button/domain/models/button.model";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";
import { IconBadgeComponent } from "@shared/design-system/icon-badge/infrastructure/components/icon-badge.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";

@Component({
  selector: "ds-confirm-action-modal",
  templateUrl: "./confirm-action-modal.component.html",
  imports: [
    ButtonComponent,
    ContextualTranslatePipe,
    IconBadgeComponent,
    ModalSheetComponent,
    NoteComponent,
    StackComponent,
    TextComponent,
  ],
})
export class ConfirmActionModalComponent {
  @Input() show: boolean = false;
  @Input() title: string = "";
  @Input() body: string = "";
  @Input() itemName: string = "";
  @Input() warningText: string = "";
  @Input() isDeleting: boolean = false;
  @Input() cancelLabel: string = "Cancel";
  @Input() confirmLabel: string = "Delete";
  @Input() deletingLabel: string = "Deleting...";
  @Input() confirmVariant: ButtonVariant = "danger";
  @Input() iconVariant: "danger" | "success" = "danger";

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  get badgeIcon(): DsIconName {
    return this.iconVariant === "success" ? "check" : "trash";
  }

  onDismiss(): void {
    if (this.isDeleting) {
      return;
    }

    this.cancelled.emit();
  }
}
