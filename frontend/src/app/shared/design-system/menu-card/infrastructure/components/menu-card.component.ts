import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";
import { MacroBadgesComponent } from "../../../macro-badges/infrastructure/components/macro-badges.component";
import { MacroBadge } from "../../../macro-badges/domain/models/macro-badge.model";

@Component({
  selector: "ds-menu-card",
  standalone: true,
  imports: [IconComponent, MacroBadgesComponent],
  template: `
    <div class="ds-mcard">
      <button type="button" class="ds-mcard__main" (click)="activated.emit()">
        <span class="ds-mcard__emoji">{{ emoji }}</span>
        <span class="ds-mcard__text">
          <span class="ds-mcard__name">{{ name }}</span>
          <span class="ds-mcard__meta">{{ meta }}</span>
        </span>
        <span class="ds-mcard__energy">
          <span class="ds-mcard__kcal">{{ kcal }}</span>
          <span class="ds-mcard__kcalCaption">{{ kcalCaption }}</span>
        </span>
      </button>

      <ds-macro-badges [macros]="macros" />

      @if (canWrite) {
        <div class="ds-mcard__actions">
          <button type="button" class="ds-mcard__load" (click)="loaded.emit()">
            <ds-icon
              class="ds-mcard__loadIcon"
              [name]="loadIcon"
              [size]="14"
              [stroke]="2.4"
            />
            {{ loadLabel }}
          </button>
          <button
            type="button"
            class="ds-mcard__action"
            [attr.aria-label]="shopLabel"
            [attr.title]="shopLabel"
            (click)="shopped.emit()"
          >
            <ds-icon name="cart" [size]="17" [stroke]="2.1" />
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-mcard {
        display: flex;
        flex-direction: column;
        gap: 10px;
        height: 100%;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: 16px;
        padding: 12px;
        transition: border-color var(--ds-transition-fast);
      }
      .ds-mcard:hover {
        border-color: var(--ds-border-strong);
      }
      .ds-mcard__main {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        text-align: left;
        appearance: none;
        border: none;
        background: transparent;
        padding: 0;
        font: inherit;
        color: inherit;
        cursor: pointer;
      }
      .ds-mcard__emoji {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: var(--ds-surface-inset);
        font-size: 26px;
      }
      .ds-mcard__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .ds-mcard__name {
        font-size: 14.5px;
        font-weight: var(--ds-weight-bold);
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-mcard__meta {
        font-size: 11px;
        color: var(--ds-text-muted);
      }
      .ds-mcard__energy {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;
      }
      .ds-mcard__kcal {
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: 17px;
        line-height: 1;
        color: var(--ds-primary);
      }
      .ds-mcard__kcalCaption {
        font-size: 9px;
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text-meta);
      }
      .ds-mcard__actions {
        display: flex;
        gap: 7px;
        margin-top: auto;
        padding-top: 2px;
      }
      .ds-mcard__load {
        flex: 1 1 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        appearance: none;
        border: none;
        cursor: pointer;
        background: var(--ds-primary);
        color: var(--ds-on-primary);
        border-radius: 11px;
        padding: 9px;
        font: inherit;
        font-size: 12px;
        font-weight: var(--ds-weight-bold);
      }
      .ds-mcard__loadIcon {
        color: var(--ds-accent);
      }
      .ds-mcard__action {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        appearance: none;
        border: none;
        cursor: pointer;
        background: var(--ds-surface-inset);
        color: var(--ds-text);
        border-radius: 11px;
      }
    `,
  ],
})
export class MenuCardComponent {
  @Input() emoji = "";
  @Input() name = "";
  @Input() meta = "";
  @Input() kcal = "";
  @Input() kcalCaption = "";
  @Input() macros: MacroBadge[] = [];
  @Input() loadLabel = "";
  @Input() loadIcon: DsIconName = "download";
  @Input() shopLabel = "";
  @Input() canWrite = false;

  @Output() activated = new EventEmitter<void>();
  @Output() loaded = new EventEmitter<void>();
  @Output() shopped = new EventEmitter<void>();
}
