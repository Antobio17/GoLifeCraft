import { Component, input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-completion-card",
  imports: [IconComponent],
  template: `
    <section class="ds-ccard">
      <span class="ds-ccard__badge" aria-hidden="true">
        <ds-icon [name]="icon()" [size]="24" [stroke]="2.8" />
      </span>
      <span class="ds-ccard__title">{{ title() }}</span>
      @if (text()) {
        <span class="ds-ccard__text">{{ text() }}</span>
      }
      <div class="ds-ccard__actions">
        <ng-content />
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-ccard {
        --ds-pad: var(--ds-space-5);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--ds-space-2);
        padding: var(--ds-pad);
        text-align: center;
        border-radius: var(--ds-radius-surface);
        border: 1px solid var(--ds-sheet-border);
        background:
          radial-gradient(
            90% 70% at 50% 0%,
            color-mix(in srgb, var(--ds-accent) 20%, transparent),
            transparent 70%
          ),
          var(--ds-module-hero-base, var(--ds-surface));
        box-shadow: var(--ds-hero-shadow);
      }
      .ds-ccard__badge {
        width: 3rem;
        height: 3rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--ds-space-1);
        border-radius: var(--ds-radius-pill);
        background: var(--ds-accent);
        color: var(--ds-on-accent);
      }
      .ds-ccard__title {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-xl);
        font-weight: var(--ds-weight-bold);
        letter-spacing: -0.02em;
        color: var(--ds-text);
      }
      .ds-ccard__text {
        max-width: 32ch;
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
        text-wrap: balance;
      }
      .ds-ccard__actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--ds-space-2);
        width: 100%;
        margin-top: var(--ds-space-2);
      }
    `,
  ],
})
export class CompletionCardComponent {
  readonly icon = input<DsIconName>("check");
  readonly title = input("");
  readonly text = input("");
}
