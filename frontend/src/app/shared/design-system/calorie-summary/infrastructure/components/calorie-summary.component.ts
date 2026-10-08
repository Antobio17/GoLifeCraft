import { Component, input } from "@angular/core";
import { ModuleCardComponent } from "@shared/design-system/module-card/infrastructure/components/module-card.component";
import {
  ChipComponent,
  ChipTone,
} from "@shared/design-system/chip/infrastructure/components/chip.component";
import { StackedBarComponent } from "@shared/design-system/stacked-bar/infrastructure/components/stacked-bar.component";
import { StackedBarSegment } from "@shared/design-system/stacked-bar/domain/models/stacked-bar-segment.model";
import { StatStripComponent } from "@shared/design-system/stat-strip/infrastructure/components/stat-strip.component";
import { StatStripItem } from "@shared/design-system/stat-strip/domain/models/stat-strip-item.model";

@Component({
  selector: "ds-calorie-summary",
  imports: [
    ModuleCardComponent,
    ChipComponent,
    StackedBarComponent,
    StatStripComponent,
  ],
  template: `
    <ds-module-card [hero]="hero()" [eyebrow]="eyebrow()">
      @if (statusLabel()) {
        <ds-chip slot="aside" [tone]="statusTone()">
          <span class="ds-csum__dot" aria-hidden="true"></span>
          {{ statusLabel() }}
        </ds-chip>
      }

      <div class="ds-csum__head">
        <span class="ds-csum__title" [class.ds-csum__title--over]="over()">{{
          title()
        }}</span>
        @if (caption()) {
          <span class="ds-csum__caption">{{ caption() }}</span>
        }
      </div>

      <ds-stacked-bar
        [segments]="segments()"
        [marker]="marker()"
        [ariaLabel]="title()"
      />

      <ds-stat-strip [compact]="true" [items]="stats()" />
    </ds-module-card>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-csum__dot {
        flex: none;
        width: 0.375rem;
        height: 0.375rem;
        margin-right: var(--ds-space-1-5);
        border-radius: var(--ds-radius-pill);
        background: currentColor;
      }
      .ds-csum__head {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1);
        min-width: 0;
      }
      .ds-csum__title {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-xl);
        font-weight: var(--ds-weight-semibold);
        line-height: 1.15;
        letter-spacing: -0.01em;
        font-variant-numeric: tabular-nums;
        color: var(--ds-text);
        overflow-wrap: anywhere;
      }
      .ds-csum__title--over {
        color: var(--ds-danger-soft-text);
      }
      .ds-csum__caption {
        font-size: var(--ds-text-base);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text-muted);
      }
    `,
  ],
})
export class CalorieSummaryComponent {
  readonly eyebrow = input("");
  readonly hero = input(false);
  readonly statusLabel = input("");
  readonly statusTone = input<ChipTone>("neutral");
  readonly title = input("");
  readonly over = input(false);
  readonly caption = input("");
  readonly segments = input<StackedBarSegment[]>([]);
  readonly marker = input<number | null>(null);
  readonly stats = input<StatStripItem[]>([]);
}
