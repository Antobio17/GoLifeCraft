import { MacroBarLabels } from "../../../macro-bar/domain/models/macro-bar-labels.model";
import { Component, computed, input, output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";
import { MacroBarComponent } from "../../../macro-bar/infrastructure/components/macro-bar.component";
import {
  MenuComponent,
  MenuItem,
} from "../../../menu/infrastructure/components/menu.component";

@Component({
  selector: "ds-menu-card",
  imports: [IconComponent, MacroBarComponent, MenuComponent],
  template: `
    <article class="ds-mcard">
      <button type="button" class="ds-mcard__main" (click)="activated.emit()">
        <span class="ds-mcard__name">{{ name() }}</span>
        @if (meta()) {
          <span class="ds-mcard__meta">{{ meta() }}</span>
        }
        <ds-macro-bar
          class="ds-mcard__macros"
          [protein]="protein()"
          [fat]="fat()"
          [carbs]="carbs()"
          [ariaLabel]="macrosLabel()"
          [labels]="macroLabels()"
        />
      </button>

      <div class="ds-mcard__aside">
        <ds-menu
          data-testid="menu-card-more"
          [compact]="true"
          [triggerLabel]="moreLabel()"
          [items]="moreItems()"
          (selected)="onMore($event)"
        />
        @if (!loadInMenu()) {
          <button
            type="button"
            class="ds-mcard__load"
            data-testid="menu-card-load"
            [attr.aria-label]="loadLabel()"
            [attr.title]="loadLabel()"
            (click)="loaded.emit()"
          >
            <ds-icon [name]="loadIcon()" [size]="18" [stroke]="2.4" />
          </button>
        }
      </div>
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-mcard {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        padding: var(--ds-space-3) var(--ds-space-3) var(--ds-space-3)
          var(--ds-space-4);
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-surface);
        box-shadow: var(--ds-shadow-card);
        transition: border-color var(--ds-transition-fast);
      }
      .ds-mcard:hover {
        border-color: var(--ds-primary-soft-border);
      }
      .ds-mcard__main {
        appearance: none;
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1-5);
        padding: 0;
        border: none;
        background: transparent;
        color: var(--ds-text);
        font-family: var(--ds-font-body);
        text-align: left;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .ds-mcard__name {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        letter-spacing: -0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-mcard__meta {
        font-size: var(--ds-text-base);
        color: var(--ds-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-mcard__macros {
        width: min(100%, 22rem);
      }
      .ds-mcard__aside {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: var(--ds-space-1);
      }
      .ds-mcard__load {
        appearance: none;
        width: 2.75rem;
        height: 2.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 50%;
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: transform var(--ds-dur-1) var(--ds-ease-out);
      }
      .ds-mcard__load:hover {
        background: var(--ds-primary-soft-hover);
      }
      .ds-mcard__load:active {
        transform: scale(0.92);
      }
      .ds-mcard__main:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
        border-radius: var(--ds-radius-mark);
      }
      .ds-mcard__load:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
      }
    `,
  ],
})
export class MenuCardComponent {
  readonly name = input("");
  readonly meta = input("");
  readonly protein = input(0);
  readonly fat = input(0);
  readonly carbs = input(0);
  readonly macrosLabel = input("");
  readonly macroLabels = input<MacroBarLabels | null>(null);
  readonly loadLabel = input("");
  readonly loadInMenu = input(false);
  readonly loadIcon = input<DsIconName>("download");
  readonly moreLabel = input("");
  readonly shopLabel = input("");
  readonly exportLabel = input("");

  readonly activated = output<void>();
  readonly loaded = output<void>();
  readonly shopped = output<void>();
  readonly exported = output<void>();

  readonly moreItems = computed<MenuItem[]>(() => [
    ...(this.loadInMenu()
      ? [{ value: "load", label: this.loadLabel(), icon: this.loadIcon() }]
      : []),
    { value: "shop", label: this.shopLabel(), icon: "cart" },
    { value: "export", label: this.exportLabel(), icon: "share" },
  ]);

  onMore(value: string): void {
    if (value === "load") {
      this.loaded.emit();
      return;
    }

    if (value === "shop") {
      this.shopped.emit();

      return;
    }

    this.exported.emit();
  }
}
