import { NgTemplateOutlet } from "@angular/common";
import { Component, input, output } from "@angular/core";
import { PressableComponent } from "../../../pressable/infrastructure/components/pressable.component";
import { GlyphComponent } from "../../../glyph/infrastructure/components/glyph.component";
import { DsGlyph } from "../../../glyph/domain/models/ds-glyph.enum";
import {
  ChipComponent,
  ChipTone,
} from "../../../chip/infrastructure/components/chip.component";
import {
  BudgetMeterComponent,
  BudgetMeterTone,
} from "../../../budget-meter/infrastructure/components/budget-meter.component";

@Component({
  selector: "ds-budget-row",
  imports: [
    NgTemplateOutlet,
    PressableComponent,
    GlyphComponent,
    ChipComponent,
    BudgetMeterComponent,
  ],
  template: `
    <div class="ds-brow" [class.ds-brow--selected]="selected()">
      @if (pressable()) {
        <ds-pressable
          [ariaLabel]="pressLabel() || title()"
          gap="var(--ds-space-3)"
          (press)="pressed.emit()"
        >
          <ng-container [ngTemplateOutlet]="head" />
        </ds-pressable>
      } @else {
        <div class="ds-brow__static">
          <ng-container [ngTemplateOutlet]="head" />
        </div>
      }

      @if (ratio() !== null) {
        <ds-budget-meter
          class="ds-brow__meter"
          [ratio]="ratio()!"
          [paceRatio]="paceRatio()"
          [tone]="tone()"
          [ariaLabel]="title()"
        />
      }
    </div>

    <ng-template #head>
      <ds-glyph
        [name]="glyph()"
        [tile]="true"
        [size]="18"
        [color]="color()"
        box="2rem"
      />
      <span class="ds-brow__body">
        <span class="ds-brow__title">{{ title() }}</span>
        @if (meta()) {
          <span class="ds-brow__meta">{{ meta() }}</span>
        }
      </span>
      <span class="ds-brow__end">
        @if (amountLabel()) {
          <span class="ds-brow__amount">{{ amountLabel() }}</span>
        }
        @if (chipLabel()) {
          <ds-chip [tone]="chipTone()">{{ chipLabel() }}</ds-chip>
        }
      </span>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      :host(:not(:first-child)) .ds-brow {
        border-top: 1px solid var(--ds-border-hairline);
      }
      .ds-brow {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-2);
        padding: var(--ds-space-3);
      }
      .ds-brow--selected {
        background: var(--ds-surface-hover);
      }
      .ds-brow__static {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        min-width: 0;
      }
      .ds-brow__body {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-brow__title {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-brow__meta {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-medium);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text-meta);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-brow__end {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;
      }
      .ds-brow__amount {
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: var(--ds-text-base);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text);
        white-space: nowrap;
      }
      .ds-brow__meter {
        margin-left: calc(var(--ds-space-8) + var(--ds-space-3));
      }
    `,
  ],
})
export class BudgetRowComponent {
  readonly glyph = input.required<`${DsGlyph}`>();
  readonly color = input("");
  readonly title = input("");
  readonly meta = input("");
  readonly amountLabel = input("");
  readonly chipLabel = input("");
  readonly chipTone = input<ChipTone>("neutral");
  readonly ratio = input<number | null>(null);
  readonly paceRatio = input(0);
  readonly tone = input<BudgetMeterTone>("positive");
  readonly pressable = input(false);
  readonly pressLabel = input("");
  readonly selected = input(false);

  readonly pressed = output<void>();
}
