import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";

@Component({
  selector: "ds-discard-changes-modal",
  imports: [
    ContextualTranslatePipe,
    ModalSheetComponent,
    StackComponent,
    TextComponent,
  ],
  template: `
    <ds-modal-sheet
      [open]="show"
      [title]="'discardChanges.title' | t"
      [closeLabel]="'discardChanges.cancel' | t"
      [confirmLabel]="'discardChanges.confirm' | t"
      [confirmArmedLabel]="'discardChanges.confirmArmed' | t"
      confirmIcon="trash"
      confirmTone="danger"
      [confirmTwice]="true"
      (confirmed)="confirmed.emit()"
      (closed)="cancelled.emit()"
    >
      <ds-stack gap="var(--ds-space-1)">
        <ds-text>{{ "discardChanges.body" | t }}</ds-text>
        <ds-text variant="muted">{{ "discardChanges.hint" | t }}</ds-text>
      </ds-stack>
    </ds-modal-sheet>
  `,
})
export class DiscardChangesModalComponent {
  @Input() show = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
