import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ButtonComponent } from "@shared/shared/button/infrastructure/components/button.component";
import { ButtonVariant } from "@shared/shared/button/domain/models/button.model";
import { ContextualTranslatePipe } from "@shared/shared/i18n/infrastructure/pipes/contextual-translate.pipe";

@Component({
  selector: "app-confirm-action-modal",
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
  @Input() cancelLabel: string = "Cancelar";
  @Input() confirmLabel: string = "Eliminar";
  @Input() deletingLabel: string = "Eliminando...";
  @Input() confirmVariant: ButtonVariant = "danger";
  @Input() iconVariant: "danger" | "success" = "danger";

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
