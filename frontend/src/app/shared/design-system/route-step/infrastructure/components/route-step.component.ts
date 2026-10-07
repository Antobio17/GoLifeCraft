import { Component, input, output } from "@angular/core";
import { StepBadgeComponent } from "../../../step-badge/infrastructure/components/step-badge.component";
import { StepBadgeState } from "../../../step-badge/domain/models/step-badge-state.enum";

@Component({
  selector: "ds-route-step",
  imports: [StepBadgeComponent],
  template: `
    <section class="ds-rstep" [class.ds-rstep--done]="state() === 'done'">
      <div class="ds-rstep__node">
        <ds-step-badge [label]="badge()" [state]="state()" />
      </div>
      <header class="ds-rstep__head">
        <h3 class="ds-rstep__title">{{ title() }}</h3>
        <span class="ds-rstep__meta">{{ meta() }}</span>
        @if (actionLabel()) {
          <button
            type="button"
            class="ds-rstep__action"
            (click)="action.emit()"
          >
            {{ actionLabel() }}
          </button>
        }
      </header>
      <div class="ds-rstep__items"><ng-content /></div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .ds-rstep {
        display: grid;
        grid-template-columns: 1.625rem minmax(0, 1fr);
        column-gap: var(--ds-space-3);
      }
      .ds-rstep__node {
        grid-row: 1 / span 2;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .ds-rstep__node::after {
        content: "";
        flex: 1;
        width: 2px;
        margin-top: var(--ds-space-1);
        border-radius: var(--ds-radius-pill);
        background: var(--ds-border);
      }
      :host(:last-child) .ds-rstep__node::after {
        display: none;
      }
      .ds-rstep__head {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: var(--ds-space-2);
        min-height: 1.625rem;
        padding-top: 2px;
      }
      .ds-rstep__title {
        margin: 0;
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
      }
      .ds-rstep--done .ds-rstep__title {
        color: var(--ds-text-muted);
      }
      .ds-rstep__meta {
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
      }
      .ds-rstep__action {
        margin-left: auto;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--ds-primary);
        font: inherit;
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-bold);
        cursor: pointer;
      }
      .ds-rstep__action:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
        border-radius: var(--ds-radius-mark);
      }
      .ds-rstep__items {
        display: flex;
        flex-direction: column;
        min-width: 0;
        gap: var(--ds-space-1-5);
        padding: var(--ds-space-1-5) 0 var(--ds-space-3);
      }
      .ds-rstep--done .ds-rstep__items {
        padding-bottom: var(--ds-space-2);
      }
    `,
  ],
})
export class RouteStepComponent {
  readonly title = input("");
  readonly meta = input("");
  readonly badge = input("");
  readonly state = input<`${StepBadgeState}`>(StepBadgeState.Pending);
  readonly actionLabel = input("");
  readonly action = output<void>();
}
