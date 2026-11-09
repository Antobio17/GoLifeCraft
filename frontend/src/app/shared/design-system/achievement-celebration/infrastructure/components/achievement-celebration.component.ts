import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
  viewChild,
} from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";
import { AchievementMedalComponent } from "../../../achievement-medal/infrastructure/components/achievement-medal.component";
import { MedalTier } from "../../../achievement-medal/domain/models/medal-tier.enum";
import { ScrollLockService } from "../../../scroll-lock/application/services/scroll-lock.service";

const CONFETTI_PIECES = Array.from({ length: 18 }, (_, index) => index);

@Component({
  selector: "ds-achievement-celebration",
  imports: [IconComponent, AchievementMedalComponent],
  host: {
    "(document:keydown.escape)": "closed.emit()",
  },
  template: `
    <section
      class="celebration"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ds-celebration-title"
      [attr.data-tier]="tier()"
    >
      <span class="celebration__confetti" aria-hidden="true">
        @for (piece of confetti; track piece) {
          <span class="celebration__piece"></span>
        }
      </span>

      <button
        type="button"
        class="celebration__close"
        [attr.aria-label]="closeLabel()"
        (click)="closed.emit()"
      >
        <ds-icon name="close" [size]="20" />
      </button>

      <span class="celebration__body">
        <span class="celebration__medal">
          <ds-achievement-medal [icon]="icon()" [tier]="tier()" size="lg" />
        </span>
        <span class="celebration__eyebrow">{{ eyebrow() }}</span>
        <span class="celebration__title" id="ds-celebration-title">{{
          title()
        }}</span>
        @if (text()) {
          <span class="celebration__text">{{ text() }}</span>
        }
        @if (chips().length > 0) {
          <span class="celebration__chips">
            @for (chip of chips(); track chip) {
              <span class="celebration__chip">{{ chip }}</span>
            }
          </span>
        }
      </span>

      <span class="celebration__actions">
        <button
          #primaryButton
          type="button"
          class="celebration__primary"
          (click)="primary.emit()"
        >
          {{ primaryLabel() }}
        </button>
        @if (secondaryLabel()) {
          <button
            type="button"
            class="celebration__secondary"
            (click)="secondary.emit()"
          >
            {{ secondaryLabel() }}
          </button>
        }
      </span>
    </section>
  `,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        z-index: var(--ds-z-modal, 1000);
        display: flex;
        justify-content: center;
        background: var(--ds-bg);
      }
      .celebration {
        --tier: var(--ds-tier-gold);
        --tier-text: var(--ds-tier-gold-text);
        position: relative;
        box-sizing: border-box;
        width: 100%;
        max-width: var(--ds-app-frame-width, 30rem);
        min-height: 100%;
        display: flex;
        flex-direction: column;
        padding: max(env(safe-area-inset-top), var(--ds-space-5))
          var(--ds-space-5) max(env(safe-area-inset-bottom), var(--ds-space-6));
        overflow: hidden;
        font-family: var(--ds-font-body);
        color: var(--ds-text);
      }
      .celebration[data-tier="bronze"] {
        --tier: var(--ds-tier-bronze);
        --tier-text: var(--ds-tier-bronze-text);
      }
      .celebration[data-tier="silver"] {
        --tier: var(--ds-tier-silver);
        --tier-text: var(--ds-tier-silver-text);
      }
      .celebration[data-tier="platinum"] {
        --tier: var(--ds-tier-platinum);
        --tier-text: var(--ds-tier-platinum-text);
      }
      .celebration__close {
        position: relative;
        z-index: 1;
        align-self: flex-end;
        appearance: none;
        cursor: pointer;
        width: 2.75rem;
        height: 2.75rem;
        border: none;
        border-radius: 50%;
        background: var(--ds-surface-inset);
        color: var(--ds-text);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .celebration__body {
        position: relative;
        z-index: 1;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--ds-space-3);
        text-align: center;
      }
      .celebration__medal {
        display: inline-flex;
        padding: var(--ds-space-5);
        margin-bottom: var(--ds-space-3);
        border-radius: 50%;
        background: color-mix(in srgb, var(--tier) 10%, transparent);
        box-shadow:
          0 0 0 1px color-mix(in srgb, var(--tier) 35%, transparent),
          0 0 0 1.75rem color-mix(in srgb, var(--tier) 7%, transparent),
          0 0 4rem color-mix(in srgb, var(--tier) 30%, transparent);
        animation: celebration-pop 520ms var(--ds-ease-out, ease-out);
      }
      .celebration__eyebrow {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--tier-text);
      }
      .celebration__title {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-3xl);
        font-weight: var(--ds-weight-bold);
        line-height: 1.05;
        letter-spacing: -0.02em;
      }
      .celebration__text {
        max-width: 18rem;
        font-size: var(--ds-text-md);
        line-height: 1.45;
        color: var(--ds-text-muted);
      }
      .celebration__chips {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--ds-space-2);
      }
      .celebration__chip {
        padding: var(--ds-space-1-5) var(--ds-space-3);
        border-radius: var(--ds-radius-pill);
        border: 1px solid var(--ds-border);
        background: var(--ds-surface);
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
      }
      .celebration__actions {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-2);
      }
      .celebration__primary,
      .celebration__secondary {
        appearance: none;
        cursor: pointer;
        font: inherit;
        min-height: 3.25rem;
        border-radius: var(--ds-radius-cta);
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
      }
      .celebration__primary {
        border: none;
        background: var(--ds-primary);
        color: var(--ds-on-primary);
      }
      .celebration__secondary {
        border: none;
        background: transparent;
        color: var(--ds-text);
      }
      .celebration__close:focus-visible,
      .celebration__primary:focus-visible,
      .celebration__secondary:focus-visible {
        outline: none;
        box-shadow: var(--ds-focus-ring);
      }
      .celebration__confetti {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .celebration__piece {
        position: absolute;
        top: -1rem;
        width: 0.5rem;
        height: 0.875rem;
        border-radius: 0.125rem;
        background: var(--tier);
        opacity: 0.9;
        animation: celebration-fall 2600ms linear forwards;
      }
      .celebration__piece:nth-child(3n) {
        width: 0.625rem;
        height: 0.375rem;
        background: var(--ds-module, var(--ds-accent));
      }
      .celebration__piece:nth-child(3n + 1) {
        background: var(--ds-module-gym, var(--tier));
      }
      .celebration__piece:nth-child(4n) {
        background: var(--ds-tier-platinum);
      }
      .celebration__piece:nth-child(1) {
        left: 6%;
        animation-delay: 0ms;
      }
      .celebration__piece:nth-child(2) {
        left: 14%;
        animation-delay: 240ms;
      }
      .celebration__piece:nth-child(3) {
        left: 22%;
        animation-delay: 80ms;
      }
      .celebration__piece:nth-child(4) {
        left: 30%;
        animation-delay: 420ms;
      }
      .celebration__piece:nth-child(5) {
        left: 38%;
        animation-delay: 160ms;
      }
      .celebration__piece:nth-child(6) {
        left: 46%;
        animation-delay: 520ms;
      }
      .celebration__piece:nth-child(7) {
        left: 54%;
        animation-delay: 40ms;
      }
      .celebration__piece:nth-child(8) {
        left: 62%;
        animation-delay: 360ms;
      }
      .celebration__piece:nth-child(9) {
        left: 70%;
        animation-delay: 200ms;
      }
      .celebration__piece:nth-child(10) {
        left: 78%;
        animation-delay: 600ms;
      }
      .celebration__piece:nth-child(11) {
        left: 86%;
        animation-delay: 120ms;
      }
      .celebration__piece:nth-child(12) {
        left: 94%;
        animation-delay: 300ms;
      }
      .celebration__piece:nth-child(13) {
        left: 10%;
        animation-delay: 700ms;
      }
      .celebration__piece:nth-child(14) {
        left: 34%;
        animation-delay: 820ms;
      }
      .celebration__piece:nth-child(15) {
        left: 50%;
        animation-delay: 900ms;
      }
      .celebration__piece:nth-child(16) {
        left: 66%;
        animation-delay: 760ms;
      }
      .celebration__piece:nth-child(17) {
        left: 82%;
        animation-delay: 980ms;
      }
      .celebration__piece:nth-child(18) {
        left: 90%;
        animation-delay: 1060ms;
      }
      @keyframes celebration-fall {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 0.95;
        }
        100% {
          transform: translateY(100vh) rotate(540deg);
          opacity: 0;
        }
      }
      @keyframes celebration-pop {
        0% {
          transform: scale(0.6);
          opacity: 0;
        }
        70% {
          transform: scale(1.06);
          opacity: 1;
        }
        100% {
          transform: scale(1);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .celebration__confetti {
          display: none;
        }
        .celebration__medal {
          animation: none;
        }
      }
    `,
  ],
})
export class AchievementCelebrationComponent {
  private scrollLock = inject(ScrollLockService);

  readonly icon = input.required<DsIconName>();
  readonly tier = input<`${MedalTier}`>(MedalTier.Gold);
  readonly eyebrow = input("");
  readonly title = input("");
  readonly text = input("");
  readonly chips = input<string[]>([]);
  readonly primaryLabel = input("");
  readonly secondaryLabel = input("");
  readonly closeLabel = input("");

  readonly primary = output<void>();
  readonly secondary = output<void>();
  readonly closed = output<void>();

  private readonly primaryButton =
    viewChild<ElementRef<HTMLButtonElement>>("primaryButton");

  readonly confetti = CONFETTI_PIECES;

  constructor() {
    this.scrollLock.lock(this);
    inject(DestroyRef).onDestroy(() => this.scrollLock.release(this));

    afterNextRender(() => this.primaryButton()?.nativeElement.focus());
  }
}
