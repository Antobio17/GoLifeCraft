import { NgTemplateOutlet } from "@angular/common";
import { Component, computed, inject, input } from "@angular/core";
import { MacroBarLabels } from "@shared/design-system/macro-bar/domain/models/macro-bar-labels.model";
import { MacroShareService } from "@shared/design-system/macro-bar/application/services/macro-share.service";

@Component({
  selector: "ds-macro-bar",
  imports: [NgTemplateOutlet],
  template: `
    @if (figures(); as items) {
      <span class="ds-mbar-row">
        <ng-container [ngTemplateOutlet]="bar" />
        <span class="ds-mbar-figures" aria-hidden="true">
          @for (item of items; track item.tone) {
            <span [class]="'ds-mbar-figure ds-mbar-figure--' + item.tone"
              >{{ item.grams
              }}<span class="ds-mbar-figure__letter">{{
                item.letter
              }}</span></span
            >
          }
        </span>
      </span>
    } @else {
      <ng-container [ngTemplateOutlet]="bar" />
    }

    <ng-template #bar>
      <span
        class="ds-mbar"
        role="img"
        [class.ds-mbar--empty]="empty()"
        [attr.aria-label]="ariaLabel() || null"
      >
        @for (segment of segments(); track segment.tone) {
          <span
            [class]="'ds-mbar__segment ds-mbar__segment--' + segment.tone"
            [style.flex-grow]="segment.percent"
          ></span>
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
      .ds-mbar-row {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        min-width: 0;
      }
      .ds-mbar-row .ds-mbar {
        flex: 1 1 auto;
        min-width: 2.5rem;
      }
      .ds-mbar-figures {
        flex: 0 0 auto;
        display: flex;
        gap: var(--ds-space-2);
        font-size: var(--ds-text-md);
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        line-height: 1;
      }
      .ds-mbar-figure__letter {
        margin-left: 1px;
        font-weight: var(--ds-weight-semibold);
        opacity: 0.75;
      }
      .ds-mbar-figure--protein {
        color: var(--ds-bar-protein);
      }
      .ds-mbar-figure--fat {
        color: var(--ds-bar-fat);
      }
      .ds-mbar-figure--carbs {
        color: var(--ds-warning);
      }
      .ds-mbar {
        display: flex;
        gap: var(--ds-bar-segment-gap);
        height: 0.25rem;
        overflow: hidden;
        border-radius: var(--ds-radius-mark);
      }
      .ds-mbar--empty {
        background: var(--ds-surface-inset);
      }
      .ds-mbar__segment {
        flex-basis: 0;
        flex-shrink: 1;
        min-width: 0;
        transition: flex-grow var(--ds-dur-4) var(--ds-ease-in-out);
      }
      .ds-mbar__segment--protein {
        background: var(--ds-bar-protein);
      }
      .ds-mbar__segment--fat {
        background: var(--ds-bar-fat);
      }
      .ds-mbar__segment--carbs {
        background: var(--ds-bar-carbs);
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-mbar__segment {
          transition: none;
        }
      }
    `,
  ],
})
export class MacroBarComponent {
  private macroShareService = inject(MacroShareService);

  readonly protein = input(0);
  readonly fat = input(0);
  readonly carbs = input(0);
  readonly ariaLabel = input("");
  readonly labels = input<MacroBarLabels | null>(null);

  readonly figures = computed(() => {
    const labels = this.labels();
    if (!labels) return null;

    return [
      {
        tone: "protein",
        grams: this.grams(this.protein()),
        letter: labels.protein,
      },
      { tone: "fat", grams: this.grams(this.fat()), letter: labels.fat },
      { tone: "carbs", grams: this.grams(this.carbs()), letter: labels.carbs },
    ];
  });

  readonly share = computed(() =>
    this.macroShareService.byCalories(this.protein(), this.fat(), this.carbs()),
  );

  readonly segments = computed(() => {
    const share = this.share();

    return [
      { tone: "protein", percent: share.protein },
      { tone: "fat", percent: share.fat },
      { tone: "carbs", percent: share.carbs },
    ].filter((segment) => segment.percent > 0);
  });

  readonly empty = computed(() => this.segments().length === 0);

  private grams(value: number): number {
    if (!Number.isFinite(value)) return 0;

    return Math.round(Math.max(0, value));
  }
}
