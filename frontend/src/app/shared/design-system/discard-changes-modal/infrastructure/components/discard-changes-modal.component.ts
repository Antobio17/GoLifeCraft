import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";

@Component({
  selector: "ds-discard-changes-modal",
  imports: [ConfirmActionModalComponent],
  template: `
    <ds-confirm-action-modal
      [show]="show"
      title="discardChanges.title"
      body="discardChanges.body"
      [isDeleting]="false"
      cancelLabel="discardChanges.cancel"
      confirmLabel="discardChanges.confirm"
      deletingLabel="discardChanges.confirm"
      (confirmed)="confirmed.emit()"
      (cancelled)="cancelled.emit()"
    />
  `,
})
export class DiscardChangesModalComponent {
  @Input() show = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
