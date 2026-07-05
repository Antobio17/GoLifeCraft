import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { ButtonVariant } from "@shared/design-system/button/domain/models/button.model";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";

@Component({
  selector: "ds-confirm-action-modal",
  templateUrl: "./confirm-action-modal.component.html",
  styleUrls: ["./confirm-action-modal.component.css"],
  imports: [ButtonComponent, ContextualTranslatePipe],
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
}
