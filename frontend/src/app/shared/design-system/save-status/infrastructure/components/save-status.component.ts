import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AutosaveStatus } from "@shared/autosave/domain/models/autosave-status.model";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";

@Component({
  selector: "ds-save-status",
  templateUrl: "./save-status.component.html",
  styleUrls: ["./save-status.component.css"],
  imports: [ButtonComponent, ContextualTranslatePipe, IconComponent],
})
export class SaveStatusComponent {
  @Input() status: AutosaveStatus = AutosaveStatus.Idle;
  @Input() align: "start" | "center" | "end" = "start";

  @Output() retried = new EventEmitter<void>();

  protected readonly statuses = AutosaveStatus;
}
