import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

type NoteTone = "info" | "danger";

@Component({
  selector: "ds-note",
  imports: [IconComponent],
  template: `
    <div class="ds-note">
      <span class="ds-note__icon">
        <ds-icon [name]="icon" [size]="17" [stroke]="2.2" />
      </span>
      <span class="ds-note__text"><ng-content></ng-content></span>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-note {
        display: flex;
        align-items: flex-start;
        gap: var(--ds-space-2);
        background: var(--note-bg, var(--ds-primary-soft));
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-space-3);
      }
      .ds-note__icon {
        display: inline-flex;
        flex: 0 0 auto;
        margin-top: 1px;
        color: var(--note-accent, var(--ds-primary));
      }
      .ds-note__text {
        font-size: var(--ds-text-sm);
        color: var(--note-text, var(--ds-text-muted));
        line-height: 1.4;
      }
      :host([tone="danger"]) .ds-note {
        --note-bg: var(--ds-danger-soft);
        --note-accent: var(--ds-danger);
        --note-text: var(--ds-danger);
      }
    `,
  ],
  host: {
    "[attr.tone]": "tone",
  },
})
export class NoteComponent {
  @Input() icon: DsIconName = "info";
  @Input() tone: NoteTone = "info";
}
