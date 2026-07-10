import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { IconButtonComponent } from "../../../icon-button/infrastructure/components/icon-button.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

export interface MenuItem {
  value: string;
  label: string;
  icon?: DsIconName;
  danger?: boolean;
}

@Component({
  selector: "ds-menu",
  standalone: true,
  imports: [IconComponent, IconButtonComponent],
  template: `
    <div class="ds-menu">
      <ds-icon-button
        [icon]="triggerIcon"
        variant="soft"
        [ariaLabel]="triggerLabel"
        haspopup="menu"
        [expanded]="open()"
        (clicked)="toggle()"
      />
      @if (open()) {
        <div
          class="ds-menu__backdrop"
          tabindex="-1"
          (click)="close()"
          (keydown.escape)="close()"
        ></div>
        <div class="ds-menu__panel" role="menu">
          @for (item of items; track item.value) {
            <button
              type="button"
              class="ds-menu__item"
              [class.ds-menu__item--danger]="item.danger"
              role="menuitem"
              (click)="pick(item.value)"
            >
              @if (item.icon) {
                <ds-icon [name]="item.icon" [size]="16" />
              }
              {{ item.label }}
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
        top: calc(100% + 6px);
        right: 0;
        z-index: 31;
        min-width: 168px;
        display: flex;
        flex-direction: column;
        padding: 6px;
        border-radius: var(--ds-radius-xl);
        background: var(--ds-surface-raised);
        border: 1px solid var(--ds-border-hairline);
        box-shadow: var(--ds-shadow-lg);
      }
      .ds-menu__item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 9px 12px;
        border: none;
        border-radius: var(--ds-radius-md);
        background: transparent;
        color: var(--ds-text-body);
        font: inherit;
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-semibold);
        text-align: left;
        cursor: pointer;
        transition: background var(--ds-transition-fast);
      }
      .ds-menu__item:hover {
        background: var(--ds-surface-hover);
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
