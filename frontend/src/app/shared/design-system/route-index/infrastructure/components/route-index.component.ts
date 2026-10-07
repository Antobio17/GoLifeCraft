import { Component, input, output } from "@angular/core";
import { StepBadgeComponent } from "../../../step-badge/infrastructure/components/step-badge.component";
import { RouteIndexEntry } from "../../domain/models/route-index-entry.model";

@Component({
  selector: "ds-route-index",
  imports: [StepBadgeComponent],
  template: `
    <nav class="ds-ridx" [attr.aria-label]="title() || null">
      @if (title()) {
        <span class="ds-ridx__title">{{ title() }}</span>
      }
      @for (entry of entries(); track entry.key) {
        <button
          type="button"
          class="ds-ridx__row"
          [class.ds-ridx__row--done]="entry.state === 'done'"
          (click)="picked.emit(entry.key)"
        >
          <ds-step-badge [label]="entry.badge" [state]="entry.state" />
          <span class="ds-ridx__label">{{ entry.label }}</span>
          <span class="ds-ridx__meta">{{ entry.meta }}</span>
        </button>
      }
    </nav>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-ridx {
        --ds-pad: var(--ds-space-2);
        display: flex;
        flex-direction: column;
        padding: var(--ds-pad);
        border-radius: var(--ds-radius-surface);
        border: 1px solid var(--ds-border);
        background: var(--ds-surface);
      }
      .ds-ridx__title {
        padding: var(--ds-space-1) var(--ds-space-2) var(--ds-space-2);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--ds-text-muted);
      }
      .ds-ridx__row {
        appearance: none;
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        padding: var(--ds-space-2);
        border: 0;
        border-radius: var(--ds-radius-inner);
        background: transparent;
        font: inherit;
        text-align: left;
        cursor: pointer;
        color: var(--ds-text);
        transition: var(--ds-motion-tint);
      }
      .ds-ridx__row:hover {
        background: var(--ds-surface-inset);
      }
      .ds-ridx__row:focus-visible {
        outline: none;
        box-shadow: var(--ds-focus-ring);
      }
      .ds-ridx__label {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
      }
      .ds-ridx__row--done .ds-ridx__label {
        color: var(--ds-text-muted);
        text-decoration: line-through;
      }
      .ds-ridx__meta {
        flex: none;
        font-size: var(--ds-text-xs);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text-muted);
      }
    `,
  ],
})
export class RouteIndexComponent {
  readonly title = input("");
  readonly entries = input<RouteIndexEntry[]>([]);

  readonly picked = output<string>();
}
