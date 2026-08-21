import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";

@Component({
  selector: "ds-undo-bar",
  templateUrl: "./undo-bar.component.html",
  styleUrls: ["./undo-bar.component.css"],
  imports: [ButtonComponent, ContextualTranslatePipe, IconComponent],
})
export class UndoBarComponent {
  @Input() label = "";
  @Input() show = false;
  @Input() liftedForBottomNav = true;

  @Output() undone = new EventEmitter<void>();
}
