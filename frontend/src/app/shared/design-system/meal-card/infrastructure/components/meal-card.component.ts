import { Component, input } from "@angular/core";
import { MacroBarLabels } from "@shared/design-system/macro-bar/domain/models/macro-bar-labels.model";
import { MacroBarComponent } from "@shared/design-system/macro-bar/infrastructure/components/macro-bar.component";

@Component({
  selector: "ds-meal-card",
  imports: [MacroBarComponent],
  template: `
    <section
      class="ds-meal"
      [class.ds-meal--list]="kcal()"
      [attr.aria-label]="title() || null"
    >
      @if (kcal()) {
        <header class="ds-meal__head ds-meal__head--list">
          <span class="ds-meal__title">{{ title() }}</span>
          <span class="ds-meal__kcal" [class.ds-meal__kcal--empty]="!hasItems()"
            >{{ kcal()
            }}<span class="ds-meal__unit">{{ kcalUnit() }}</span></span
          >
        </header>
        @if (hasItems()) {
          <ds-macro-bar
            [protein]="protein()"
            [fat]="fat()"
            [carbs]="carbs()"
            [ariaLabel]="macrosLabel()"
            [labels]="macroLabels()"
          />
        }
      } @else {
        <header class="ds-meal__head">
          <span class="ds-meal__text">
            <span class="ds-meal__title">{{ title() }}</span>
            @if (meta()) {
              <span class="ds-meal__meta">{{ meta() }}</span>
            }
            <ds-macro-bar
              class="ds-meal__macros"
              [protein]="protein()"
              [fat]="fat()"
              [carbs]="carbs()"
              [ariaLabel]="macrosLabel()"
            />
          </span>
        </header>
      }

      <div class="ds-meal__body">
        <ng-content />
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-meal {
        --ds-pad: var(--ds-space-4);
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-3);
        padding: var(--ds-space-3) var(--ds-space-3) var(--ds-space-2)
          var(--ds-space-4);
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-surface);
        box-shadow: var(--ds-shadow-card);
      }
      .ds-meal__head {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
      }
      .ds-meal__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1-5);
      }
      .ds-meal__title {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        letter-spacing: -0.01em;
        color: var(--ds-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-meal__meta {
        font-size: var(--ds-text-base);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text-muted);
      }
      .ds-meal__macros {
        max-width: 9rem;
      }
      .ds-meal--list {
        gap: var(--ds-space-2);
        padding: var(--ds-space-3) var(--ds-space-4) var(--ds-space-2);
      }
      .ds-meal__head--list .ds-meal__title {
        flex: 1 1 auto;
        min-width: 0;
      }
      .ds-meal__kcal {
        flex: 0 0 auto;
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-2xl);
        font-weight: var(--ds-weight-bold);
        letter-spacing: -0.02em;
        line-height: 1;
        color: var(--ds-text);
        font-variant-numeric: tabular-nums;
      }
      .ds-meal__kcal--empty {
        color: var(--ds-text-muted);
      }
      .ds-meal__unit {
        margin-left: var(--ds-space-1);
        font-family: var(--ds-font-body);
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        letter-spacing: 0;
        color: var(--ds-text-muted);
      }
      .ds-meal--list .ds-meal__body {
        gap: 0;
      }
      .ds-meal__body {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1-5);
        min-width: 0;
      }
    `,
  ],
})
export class MealCardComponent {
  readonly title = input("");
  readonly meta = input("");
  readonly kcal = input("");
  readonly kcalUnit = input("");
  readonly protein = input(0);
  readonly fat = input(0);
  readonly carbs = input(0);
  readonly macrosLabel = input("");
  readonly macroLabels = input<MacroBarLabels | null>(null);
  readonly hasItems = input(false);
}
