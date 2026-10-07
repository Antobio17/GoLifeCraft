import { Component, input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { StepBadgeState } from "../../domain/models/step-badge-state.enum";

@Component({
  selector: "ds-step-badge",
  imports: [IconComponent],
  template: `
    <span [class]="'ds-sbadge ds-sbadge--' + state()" aria-hidden="true">
      @if (state() === done) {
        <ds-icon name="check" [size]="13" [stroke]="3" />
      } @else {
        {{ label() }}
      }
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        flex: none;
      }
      .ds-sbadge {
        width: 1.625rem;
        height: 1.625rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ds-radius-pill);
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        font-variant-numeric: tabular-nums;
        transition: var(--ds-motion-tint);
      }
      .ds-sbadge--pending {
        background: var(--ds-text);
        color: var(--ds-bg);
      }
      .ds-sbadge--next {
        background: var(--ds-accent);
        color: var(--ds-on-accent);
        box-shadow: 0 0 0 0.25rem var(--ds-accent-soft);
      }
      .ds-sbadge--done {
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-sbadge--muted {
        background: var(--ds-surface-inset);
        color: var(--ds-text-muted);
      }
    `,
  ],
})
export class StepBadgeComponent {
  readonly label = input("");
  readonly state = input<`${StepBadgeState}`>(StepBadgeState.Pending);

  protected readonly done = StepBadgeState.Done;
}
