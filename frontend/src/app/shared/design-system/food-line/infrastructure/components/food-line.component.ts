import { MacroBadge } from "@shared/design-system/macro-badges/domain/models/macro-badge.model";
import { Component, computed, input, output } from "@angular/core";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";

@Component({
  selector: "ds-food-line",
  imports: [EmojiTileComponent, IconComponent],
  template: `
    <div
      class="ds-food-line"
      [class.ds-food-line--selectable]="selectable()"
      [class.ds-food-line--disabled]="selectable() && disabled()"
    >
      @if (selectable()) {
        <button
          type="button"
          class="ds-food-line__hit"
          [disabled]="disabled()"
          [attr.aria-label]="hitLabel()"
          (click)="selected.emit()"
        ></button>
      }

      <span class="ds-food-line__tile">
        <ds-emoji-tile
          [emoji]="emoji()"
          [imageUrl]="imageUrl()"
          [alt]="name()"
          [size]="32"
        />
        @if (kindIcon(); as icon) {
          <ds-icon
            class="ds-food-line__kind"
            [name]="icon"
            [size]="10"
            [stroke]="2.6"
            [attr.aria-label]="kindLabel() || null"
            [attr.title]="kindLabel() || null"
            role="img"
          />
        }
      </span>

      <span class="ds-food-line__text">
        <span class="ds-food-line__head">
          @if (openable() && !selectable()) {
            <button
              type="button"
              class="ds-food-line__name ds-food-line__name--open"
              [attr.aria-label]="openLabel() || null"
              (click)="opened.emit()"
            >
              {{ name() }}
            </button>
          } @else {
            <span class="ds-food-line__name">{{ name() }}</span>
          }
          <ng-content select="[slot=quantity]" />
          @if (quantityLabel()) {
            <span class="ds-food-line__quantity">{{ quantityLabel() }}</span>
          }
        </span>
        @if (meta()) {
          <span class="ds-food-line__meta">{{ meta() }}</span>
        }
        @if (macrosLabel()) {
          <span class="ds-food-line__meta ds-food-line__macros">{{
            macrosLabel()
          }}</span>
        }
      </span>

      <ng-content select="[slot=trailing]" />

      @if (kcal()) {
        <span class="ds-food-line__kcal"
          >{{ kcal() }}
          @if (kcalUnit()) {
            <span class="ds-food-line__unit">{{ kcalUnit() }}</span>
          }
        </span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .ds-food-line {
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        padding: var(--ds-space-2) 0;
        background: transparent;
      }
      .ds-food-line__hit {
        position: absolute;
        inset: 0;
        z-index: 0;
        appearance: none;
        padding: 0;
        margin: 0;
        border: none;
        border-radius: var(--ds-radius-inner);
        background: transparent;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: background var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-food-line__hit:hover:not(:disabled) {
        background: var(--ds-surface-inset);
      }
      .ds-food-line__hit:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
      }
      .ds-food-line__hit:disabled {
        cursor: default;
      }
      .ds-food-line--disabled {
        opacity: 0.5;
      }
      .ds-food-line--selectable > :not(.ds-food-line__hit) {
        position: relative;
        z-index: 1;
        pointer-events: none;
      }
      .ds-food-line__tile {
        position: relative;
        flex: 0 0 auto;
        display: inline-flex;
      }
      .ds-food-line__kind {
        position: absolute;
        right: -4px;
        bottom: -4px;
        width: 18px;
        height: 18px;
        align-items: center;
        justify-content: center;
        border-radius: var(--ds-radius-pill);
        border: 2px solid var(--ds-surface);
        background: var(--ds-primary);
        color: var(--ds-on-primary);
      }
      .ds-food-line__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-food-line__head {
        display: flex;
        align-items: center;
        column-gap: var(--ds-space-2);
        min-width: 0;
      }
      .ds-food-line__name {
        flex: 0 1 auto;
        min-width: 0;
        font-size: var(--ds-text-md);
        font-weight: 700;
        line-height: 1.25;
        color: var(--ds-text);
        overflow-wrap: anywhere;
      }
      .ds-food-line__name--open {
        appearance: none;
        padding: 0;
        margin: 0;
        border: none;
        background: none;
        font-family: inherit;
        text-align: left;
        cursor: pointer;
      }
      .ds-food-line__name--open:hover {
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      .ds-food-line__name--open:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
        border-radius: var(--ds-radius-control-sm);
      }
      .ds-food-line__quantity {
        font-size: var(--ds-text-base);
        font-weight: 500;
        color: var(--ds-text-muted);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      .ds-food-line__meta {
        font-size: var(--ds-text-sm);
        font-weight: 500;
        color: var(--ds-text-meta);
        overflow-wrap: anywhere;
      }
      .ds-food-line__macros {
        font-variant-numeric: tabular-nums;
      }
      .ds-food-line__kcal {
        flex: 0 0 auto;
        min-width: 2.5rem;
        text-align: right;
        font-size: var(--ds-text-md);
        font-weight: 700;
        color: var(--ds-text);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      .ds-food-line__unit {
        font-size: var(--ds-text-xs);
        font-weight: 600;
        color: var(--ds-text-muted);
      }
    `,
  ],
})
export class FoodLineComponent {
  readonly emoji = input("");
  readonly imageUrl = input<string | null>(null);
  readonly name = input("");
  readonly kindIcon = input<DsIconName | null>(null);
  readonly kindLabel = input("");
  readonly quantityLabel = input("");
  readonly meta = input("");
  readonly macros = input<MacroBadge[]>([]);
  readonly kcal = input("");
  readonly kcalUnit = input("");
  readonly openable = input(false);
  readonly openLabel = input("");
  readonly selectable = input(false);
  readonly selectLabel = input("");
  readonly disabled = input(false);

  readonly opened = output<void>();
  readonly selected = output<void>();

  protected readonly macrosLabel = computed(() =>
    this.macros()
      .filter((macro) => !!macro.value)
      .map((macro) => `${macro.label} ${macro.value}`)
      .join(" · "),
  );

  protected readonly hitLabel = computed(() =>
    [this.selectLabel(), this.name()].filter(Boolean).join(": "),
  );
}
