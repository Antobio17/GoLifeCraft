import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ButtonComponent } from "../../../button/infrastructure/components/button.component";

@Component({
  selector: "app-form-actions",
  templateUrl: "./form-actions.component.html",
  styleUrls: ["./form-actions.component.css"],
  imports: [ButtonComponent],
})
export class FormActionsComponent {
  @Input() cancelLabel: string = "";
  @Input() submitLabel: string = "";
  @Input() savingLabel: string = "";
  @Input() saving: boolean = false;
  @Input() formInvalid: boolean = false;
  @Output() cancelled = new EventEmitter<void>();
}
