import { Component, computed, input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";
import { MedalTier } from "../../domain/models/medal-tier.enum";
import { MedalSize } from "../../domain/models/medal-size.enum";

const ICON_SIZE: Record<`${MedalSize}`, number> = {
  sm: 18,
  md: 30,
  lg: 60,
};

@Component({
  selector: "ds-achievement-medal",
  imports: [IconComponent],
  template: `
    <span
      class="medal"
      [class.medal--inline]="inline()"
      [attr.data-size]="size()"
      [attr.data-tier]="tier() ?? 'locked'"
    >
      <span
        class="medal__frame"
        [class.medal__frame--ring]="null !== ring()"
        [style.--medal-ring]="ringPercent()"
      >
        <span class="medal__badge">
          <ds-icon [name]="icon()" [size]="iconSize()" [stroke]="2" />
          @if (locked()) {
            <span class="medal__lock">
              <ds-icon name="lock" [size]="11" [stroke]="2.5" />
            </span>
          }
        </span>
      </span>
      @if (name() || caption()) {
        <span class="medal__text">
          @if (name()) {
            <span class="medal__name">{{ name() }}</span>
          }
          @if (showBar()) {
            <span class="medal__bar" aria-hidden="true">
              <span
                class="medal__bar-fill"
                [style.width.%]="barPercent()"
              ></span>
            </span>
          }
          @if (caption()) {
            <span class="medal__caption">{{ caption() }}</span>
          }
        </span>
      }
    </span>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .medal {
        --medal-size: 4.5rem;
        --medal-border: 0.1875rem;
        --tier: var(--ds-border-strong);
        --tier-text: var(--ds-text-muted);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--ds-space-1-5);
        text-align: center;
        min-width: 0;
      }
      .medal[data-size="sm"] {
        --medal-size: 2.5rem;
        --medal-border: 0.125rem;
      }
      .medal[data-size="lg"] {
        --medal-size: 8.5rem;
        --medal-border: 0.375rem;
      }
      .medal[data-tier="bronze"] {
        --tier: var(--ds-tier-bronze);
        --tier-text: var(--ds-tier-bronze-text);
      }
      .medal[data-tier="silver"] {
        --tier: var(--ds-tier-silver);
        --tier-text: var(--ds-tier-silver-text);
      }
      .medal[data-tier="gold"] {
        --tier: var(--ds-tier-gold);
        --tier-text: var(--ds-tier-gold-text);
      }
      .medal[data-tier="platinum"] {
        --tier: var(--ds-tier-platinum);
        --tier-text: var(--ds-tier-platinum-text);
      }
      .medal--inline {
        flex-direction: row;
        text-align: start;
        gap: var(--ds-space-2);
      }
      .medal__frame {
        flex: none;
        display: inline-flex;
        border-radius: 50%;
      }
      .medal__frame--ring {
        padding: var(--ds-space-1);
        background: conic-gradient(
          var(--ds-module, var(--ds-accent)) 0 calc(var(--medal-ring) * 1%),
          color-mix(in srgb, currentColor 14%, transparent)
            calc(var(--medal-ring) * 1%) 100%
        );
      }
      .medal__badge {
        position: relative;
        box-sizing: border-box;
        width: var(--medal-size);
        height: var(--medal-size);
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: var(--medal-border) solid var(--tier);
        background: color-mix(in srgb, var(--tier) 16%, var(--ds-surface));
        color: var(--tier-text);
      }
      .medal[data-tier="locked"] .medal__badge {
        border-style: dashed;
        border-width: 0.125rem;
        background: var(--ds-surface-subtle);
        color: var(--ds-text-muted);
      }
      .medal__lock {
        position: absolute;
        right: -0.125rem;
        bottom: -0.125rem;
        width: 1.5rem;
        height: 1.5rem;
        box-sizing: border-box;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--ds-surface-inset);
        border: 0.125rem solid var(--ds-bg);
        color: var(--ds-text-muted);
      }
      .medal[data-size="sm"] .medal__lock {
        width: 1.125rem;
        height: 1.125rem;
        right: -0.25rem;
        bottom: -0.25rem;
      }
      .medal__text {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--ds-space-1);
        min-width: 0;
        max-width: 100%;
      }
      .medal--inline .medal__text {
        align-items: flex-start;
        gap: 0.125rem;
      }
      .medal__name {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        line-height: 1.2;
        color: var(--ds-text);
        overflow-wrap: anywhere;
      }
      .medal[data-size="lg"] .medal__name {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-2xl);
        font-weight: var(--ds-weight-bold);
      }
      .medal__caption {
        font-size: var(--ds-text-xs);
        line-height: 1.25;
        color: var(--tier-text);
        font-weight: var(--ds-weight-medium);
      }
      .medal[data-tier="locked"] .medal__caption {
        color: var(--ds-text-muted);
      }
      .medal__bar {
        display: block;
        width: 4rem;
        max-width: 100%;
        height: 0.25rem;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
        overflow: hidden;
      }
      .medal__bar-fill {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--ds-text-muted);
      }
    `,
  ],
})
export class AchievementMedalComponent {
  readonly icon = input.required<DsIconName>();
  readonly tier = input<`${MedalTier}` | null>(null);
  readonly name = input("");
  readonly caption = input("");
  readonly progress = input<number | null>(null);
  readonly ring = input<number | null>(null);
  readonly size = input<`${MedalSize}`>(MedalSize.Medium);
  readonly inline = input(false);

  readonly locked = computed(() => null === this.tier());
  readonly iconSize = computed(() => ICON_SIZE[this.size()]);
  readonly showBar = computed(() => this.locked() && null !== this.progress());
  readonly barPercent = computed(() =>
    Math.round(Math.max(0, Math.min(1, this.progress() ?? 0)) * 100),
  );
  readonly ringPercent = computed(() =>
    Math.round(Math.max(0, Math.min(1, this.ring() ?? 0)) * 100),
  );
}
