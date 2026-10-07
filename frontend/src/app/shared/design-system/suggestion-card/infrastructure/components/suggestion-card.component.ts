import { Component, input, output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-suggestion-card",
  imports: [IconComponent],
  template: `
    <aside class="ds-suggest">
      <span class="ds-suggest__icon" aria-hidden="true"
        ><ds-icon [name]="icon()" [size]="18"
      /></span>
      <span class="ds-suggest__body">
        <strong class="ds-suggest__title">{{ title() }}</strong>
        <span class="ds-suggest__text">{{ text() }}</span>
      </span>
      <button type="button" class="ds-suggest__action" (click)="action.emit()">
        {{ actionLabel() }}
      </button>
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .ds-suggest {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        padding: var(--ds-space-3);
        border: 1px dashed var(--ds-accent-soft-border);
        border-radius: var(--ds-radius-surface);
        background: var(--ds-primary-soft);
      }
      .ds-suggest__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: none;
        width: 2.125rem;
        height: 2.125rem;
        border-radius: var(--ds-radius-inner);
        background: var(--ds-surface);
        color: var(--ds-primary-soft-text);
      }
      .ds-suggest__body {
        display: flex;
        flex-direction: column;
        min-width: 0;
        gap: 2px;
      }
      .ds-suggest__title {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
      }
      .ds-suggest__text {
        font-size: var(--ds-text-sm);
        line-height: var(--ds-leading-snug);
        color: var(--ds-text-muted);
      }
      .ds-suggest__action {
        flex: none;
        margin-left: auto;
        padding: var(--ds-space-1) 0;
        border: 0;
        background: transparent;
        font: inherit;
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-primary-soft-text);
        cursor: pointer;
      }
      .ds-suggest__action:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
        border-radius: var(--ds-radius-mark);
      }
    `,
  ],
})
export class SuggestionCardComponent {
  readonly icon = input<DsIconName>("diary");
  readonly title = input("");
  readonly text = input("");
  readonly actionLabel = input("");
  readonly action = output<void>();
}
