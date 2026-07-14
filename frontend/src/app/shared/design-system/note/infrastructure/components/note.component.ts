import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-note",
  standalone: true,
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
        gap: 9px;
        background: var(--ds-primary-soft);
        border-radius: 13px;
        padding: 12px 13px;
      }
      .ds-note__icon {
        display: inline-flex;
        flex: 0 0 auto;
        margin-top: 1px;
        color: var(--ds-primary);
      }
      .ds-note__text {
        font-size: 11.5px;
        color: var(--ds-text-muted);
        line-height: 1.4;
      }
    `,
  ],
})
export class NoteComponent {
  @Input() icon: DsIconName = "info";
}
