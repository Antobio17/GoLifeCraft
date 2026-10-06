import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { ButtonComponent } from "../../../button/infrastructure/components/button.component";
import { IconButtonComponent } from "../../../icon-button/infrastructure/components/icon-button.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

export interface MenuItem {
  value: string;
  label: string;
  icon?: DsIconName;
  danger?: boolean;
  separated?: boolean;
}

@Component({
  selector: "ds-menu",
  imports: [IconComponent, ButtonComponent, IconButtonComponent],
  template: `
    <div class="ds-menu">
      @if (compact) {
        <ds-icon-button
          [icon]="triggerIcon"
          [iconSize]="18"
          [ariaLabel]="triggerLabel"
          haspopup="menu"
          [expanded]="open()"
          (clicked)="toggle()"
        />
      } @else {
        <ds-button
          variant="secondary"
          size="icon-lg"
          [icon]="triggerIcon"
          [iconSize]="19"
          [ariaLabel]="triggerLabel"
          haspopup="menu"
          [expanded]="open()"
          (clicked)="toggle()"
        />
      }
      @if (open()) {
        <div
          class="ds-menu__backdrop"
          tabindex="-1"
          (click)="close()"
          (keydown.escape)="close()"
        ></div>
        <div class="ds-menu__panel" role="menu">
          @for (item of items; track item.value) {
            @if (item.separated) {
              <div class="ds-menu__separator" role="separator"></div>
            }
            <button
              type="button"
              class="ds-menu__item"
              [class.ds-menu__item--danger]="item.danger"
              [class.ds-menu__item--active]="item.value === activeValue"
              role="menuitem"
              (click)="pick(item.value)"
            >
              @if (item.icon) {
                <ds-icon [name]="item.icon" [size]="16" />
              }
              <span class="ds-menu__label">{{ item.label }}</span>
              @if (item.value === activeValue) {
                <ds-icon
                  class="ds-menu__check"
                  name="check"
                  [size]="16"
                  [stroke]="2.5"
                />
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .ds-menu {
        position: relative;
        display: inline-flex;
      }
      .ds-menu__backdrop {
        position: fixed;
        inset: 0;
        z-index: 30;
      }
      .ds-menu__panel {
        position: absolute;
        top: calc(100% + 0.375rem);
        right: 0;
        z-index: 31;
        min-width: 10.5rem;
        display: flex;
        flex-direction: column;
        --ds-pad: var(--ds-space-1-5);
        padding: var(--ds-pad);
        border-radius: var(--ds-radius-surface);
        background: var(--ds-surface-raised);
        border: 1px solid var(--ds-border-hairline);
        box-shadow: var(--ds-shadow-lg);
      }
      .ds-menu__item {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        width: 100%;
        padding: var(--ds-space-2) var(--ds-space-3);
        border: none;
        border-radius: var(--ds-radius-control-sm);
        background: transparent;
        color: var(--ds-text-body);
        font: inherit;
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-semibold);
        text-align: left;
        cursor: pointer;
        transition: background var(--ds-transition-fast);
      }
      .ds-menu__item:hover {
        background: var(--ds-surface-hover);
      }
      .ds-menu__label {
        flex: 1 1 auto;
      }
      .ds-menu__item--active,
      .ds-menu__check {
        color: var(--ds-primary-soft-text);
      }
      .ds-menu__separator {
        height: 1px;
        margin: var(--ds-space-1) var(--ds-space-2);
        background: var(--ds-border-hairline);
      }
      .ds-menu__item--danger {
        color: var(--ds-danger);
      }
      .ds-menu__item--danger:hover {
        background: var(--ds-danger-soft);
      }
    `,
  ],
})
export class MenuComponent {
  @Input() triggerIcon: DsIconName = "dots";
  @Input() triggerLabel = "";
  @Input() items: MenuItem[] = [];
  @Input() activeValue: string | null = null;
  @Input() compact = false;

  @Output() selected = new EventEmitter<string>();

  open = signal(false);

  toggle(): void {
    this.open.update((value) => !value);
  }

  close(): void {
    this.open.set(false);
  }

  pick(value: string): void {
    this.close();
    this.selected.emit(value);
  }
}
