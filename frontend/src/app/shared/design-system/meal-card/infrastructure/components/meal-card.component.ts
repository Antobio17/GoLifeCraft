import { NgTemplateOutlet } from "@angular/common";
import { Component, computed, input, output } from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { MacroBarLabels } from "@shared/design-system/macro-bar/domain/models/macro-bar-labels.model";
import { MacroBarComponent } from "@shared/design-system/macro-bar/infrastructure/components/macro-bar.component";

@Component({
  selector: "ds-meal-card",
  imports: [IconComponent, MacroBarComponent, NgTemplateOutlet],
  template: `
    <section
      class="ds-meal"
      [class.ds-meal--list]="kcal()"
      [attr.aria-label]="title() || null"
    >
      @if (kcal()) {
        <header class="ds-meal__head ds-meal__head--list">
          @if (consumable() && showConsume()) {
            <ng-container [ngTemplateOutlet]="consume" />
          }
          <span class="ds-meal__title">{{ title() }}</span>
          <span
            class="ds-meal__kcal"
            [class.ds-meal__kcal--empty]="!consumable()"
            >{{ kcal()
            }}<span class="ds-meal__unit">{{ kcalUnit() }}</span></span
          >
        </header>
        @if (consumable()) {
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

          @if (consumable()) {
            <ng-container [ngTemplateOutlet]="consume" />
          }
        </header>
      }

      <div class="ds-meal__body">
        <ng-content />
      </div>
    </section>

    <ng-template #consume>
      <button
        type="button"
        class="ds-meal__consume"
        [class.ds-meal__consume--done]="consumed()"
        [class.ds-meal__consume--partial]="partial()"
        [attr.aria-label]="consumeLabel()"
        [attr.aria-pressed]="consumed() || partial()"
        (click)="consumeToggled.emit()"
      >
        @if (!kcal() || consumed() || partial()) {
          <ds-icon
            [name]="consumeIcon()"
            [size]="kcal() ? 15 : 16"
            [stroke]="kcal() ? 2.5 : 2.6"
          />
        }
      </button>
    </ng-template>
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
      .ds-meal__consume {
        appearance: none;
        flex: 0 0 auto;
        width: 2.75rem;
        height: 2.75rem;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: 1.5px solid var(--ds-border-strong);
        background: var(--ds-surface);
        color: var(--ds-text-muted);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition:
          var(--ds-motion-tint),
          transform var(--ds-dur-1) var(--ds-ease-out);
      }
      .ds-meal__consume:hover {
        border-color: var(--ds-primary-soft-border);
        color: var(--ds-primary-soft-text);
      }
      .ds-meal__consume:active {
        transform: scale(0.92);
      }
      .ds-meal__consume:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
      }
      .ds-meal__consume--partial {
        border-color: var(--ds-primary-soft-border);
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-meal__consume--done {
        border-color: var(--ds-primary);
        background: var(--ds-primary);
        color: var(--ds-on-primary);
      }
      .ds-meal__consume--done:hover {
        border-color: var(--ds-primary);
        color: var(--ds-on-primary);
      }
      .ds-meal--list {
        gap: var(--ds-space-2);
        padding: var(--ds-space-3) var(--ds-space-4) var(--ds-space-2);
      }
      .ds-meal__head--list .ds-meal__title {
        flex: 1 1 auto;
        min-width: 0;
      }
      .ds-meal__head--list .ds-meal__consume {
        width: 2.125rem;
        height: 2.125rem;
        background: transparent;
        border: 1.5px solid var(--ds-border);
        color: var(--ds-primary-soft-text);
      }
      .ds-meal__head--list .ds-meal__consume--partial,
      .ds-meal__head--list .ds-meal__consume--done,
      .ds-meal__head--list .ds-meal__consume--done:hover {
        background: var(--ds-primary-soft);
        border-color: var(--ds-primary-soft-border);
        color: var(--ds-primary-soft-text);
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
  readonly consumable = input(false);
  readonly showConsume = input(true);
  readonly consumed = input(false);
  readonly partial = input(false);
  readonly consumeLabel = input("");

  readonly consumeToggled = output<void>();

  protected readonly consumeIcon = computed(() =>
    this.partial() ? "minus" : "check",
  );
}
