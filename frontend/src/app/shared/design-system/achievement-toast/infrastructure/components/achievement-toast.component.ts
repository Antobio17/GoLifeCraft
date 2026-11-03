import { Component, input, output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";
import { AchievementMedalComponent } from "../../../achievement-medal/infrastructure/components/achievement-medal.component";
import { MedalTier } from "../../../achievement-medal/domain/models/medal-tier.enum";

@Component({
  selector: "ds-achievement-toast",
  imports: [IconComponent, AchievementMedalComponent],
  template: `
    <section
      class="atoast"
      role="status"
      aria-live="polite"
      [attr.data-tier]="tier()"
    >
      <ds-achievement-medal [icon]="icon()" [tier]="tier()" size="sm" />
      <span class="atoast__text">
        <span class="atoast__eyebrow">{{ eyebrow() }}</span>
        <span class="atoast__title">{{ title() }}</span>
        @if (caption()) {
          <span class="atoast__caption">{{ caption() }}</span>
        }
      </span>
      @if (actionLabel()) {
        <button type="button" class="atoast__action" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
      <button
        type="button"
        class="atoast__close"
        [attr.aria-label]="closeLabel()"
        (click)="closed.emit()"
      >
        <ds-icon name="close" [size]="16" />
      </button>
    </section>
  `,
  styles: [
    `
      :host {
        position: fixed;
        top: max(env(safe-area-inset-top), 1rem);
        left: 0;
        right: 0;
        z-index: var(--ds-z-toast, 999999);
        display: flex;
        justify-content: center;
        padding: 0 var(--ds-space-3);
        pointer-events: none;
      }
      .atoast {
        --tier-text: var(--ds-text);
        pointer-events: auto;
        box-sizing: border-box;
        width: 100%;
        max-width: var(--ds-app-frame-width, 30rem);
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        padding: var(--ds-space-3);
        border-radius: var(--ds-radius-surface);
        background: var(--ds-surface-raised);
        border: 1px solid var(--ds-border);
        box-shadow: var(--ds-shadow-float);
        font-family: var(--ds-font-body);
        animation: atoast-in var(--ds-dur-3, 320ms) var(--ds-ease-out, ease-out);
      }
      .atoast[data-tier="bronze"] {
        --tier-text: var(--ds-tier-bronze-text);
      }
      .atoast[data-tier="silver"] {
        --tier-text: var(--ds-tier-silver-text);
      }
      .atoast[data-tier="gold"] {
        --tier-text: var(--ds-tier-gold-text);
      }
      .atoast[data-tier="platinum"] {
        --tier-text: var(--ds-tier-platinum-text);
      }
      .atoast__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }
      .atoast__eyebrow {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--tier-text);
      }
      .atoast__title {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text);
      }
      .atoast__caption {
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
      }
      .atoast__action,
      .atoast__close {
        appearance: none;
        cursor: pointer;
        font: inherit;
        border: none;
        flex: none;
        min-height: 2.75rem;
        border-radius: var(--ds-radius-control-sm);
      }
      .atoast__action {
        padding: 0 var(--ds-space-3);
        background: var(--ds-surface-inset);
        color: var(--ds-text);
        font-weight: var(--ds-weight-semibold);
        font-size: var(--ds-text-sm);
      }
      .atoast__close {
        width: 2.75rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        color: var(--ds-text-muted);
      }
      .atoast__action:focus-visible,
      .atoast__close:focus-visible {
        outline: none;
        box-shadow: var(--ds-focus-ring);
      }
      @keyframes atoast-in {
        from {
          opacity: 0;
          transform: translateY(-0.75rem);
        }
        to {
          opacity: 1;
          transform: none;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .atoast {
          animation: none;
        }
      }
    `,
  ],
})
export class AchievementToastComponent {
  readonly icon = input.required<DsIconName>();
  readonly tier = input<`${MedalTier}`>(MedalTier.Bronze);
  readonly eyebrow = input("");
  readonly title = input("");
  readonly caption = input("");
  readonly actionLabel = input("");
  readonly closeLabel = input("");

  readonly action = output<void>();
  readonly closed = output<void>();
}
