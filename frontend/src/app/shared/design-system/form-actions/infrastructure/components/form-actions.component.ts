import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";

@Component({
  selector: "ds-form-actions",
  templateUrl: "./form-actions.component.html",
  styleUrls: ["./form-actions.component.css"],
  imports: [ButtonComponent],
})
export class FormActionsComponent {
  @Input() cancelLabel = "";
  @Input() submitLabel = "";
  @Input() savingLabel = "";
  @Input() saving = false;
  @Input() formInvalid = false;
  @Output() cancelled = new EventEmitter<void>();
}
