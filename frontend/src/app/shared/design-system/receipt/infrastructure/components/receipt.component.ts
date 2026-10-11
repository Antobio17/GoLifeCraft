import { Component, input, model } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";
import { ReceiptColumns } from "../../domain/models/receipt-columns.model";

@Component({
  selector: "ds-receipt",
  imports: [IconComponent],
  template: `
    <section
      class="ds-receipt"
      [class.ds-receipt--open]="open()"
      [attr.aria-label]="title()"
    >
      <button
        type="button"
        class="ds-receipt__head"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="bodyId"
        (click)="open.set(!open())"
      >
        <span class="ds-receipt__icon" aria-hidden="true">
          <ds-icon [name]="icon()" [size]="18" [stroke]="2.2" />
        </span>
        <span class="ds-receipt__titles">
          <span class="ds-receipt__title">{{ title() }}</span>
          @if (meta()) {
            <span class="ds-receipt__meta">{{ meta() }}</span>
          }
        </span>
        @if (stamp()) {
          <span class="ds-receipt__stamp">
            <ds-icon name="check" [size]="12" [stroke]="3" />
            {{ stamp() }}
          </span>
        }
        <ds-icon
          class="ds-receipt__chevron"
          name="chevronDown"
          [size]="18"
          [stroke]="2.4"
        />
      </button>

      <div
        class="ds-receipt__collapse"
        [id]="bodyId"
        [attr.inert]="open() ? null : ''"
        [attr.aria-hidden]="!open()"
      >
        <div class="ds-receipt__clip">
          <div class="ds-receipt__body">
            <hr class="ds-receipt__rule" />
            @if (columns(); as cols) {
              <div class="ds-receipt__cols" aria-hidden="true">
                <span>{{ cols.quantity }}</span>
                <span>{{ cols.name }}</span>
                <span class="ds-receipt__cols-price">{{ cols.price }}</span>
              </div>
            }
            <div class="ds-receipt__lines"><ng-content /></div>
          </div>
        </div>
      </div>

      <hr class="ds-receipt__rule" />
      <div class="ds-receipt__total">
        <span class="ds-receipt__total-label">{{ totalLabel() }}</span>
        <span class="ds-receipt__total-value">{{ total() }}</span>
      </div>
      @if (note() || noteAside()) {
        <div class="ds-receipt__note">
          <span [class.ds-receipt__note--accent]="noteAccent()">{{
            note()
          }}</span>
          <span>{{ noteAside() }}</span>
        </div>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        padding-bottom: var(--ds-space-2);
      }
      .ds-receipt {
        --ds-pad: var(--ds-space-4);
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-3);
        padding: var(--ds-pad);
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-bottom: 0;
        border-radius: var(--ds-radius-surface) var(--ds-radius-surface) 0 0;
      }
      .ds-receipt::after {
        content: "";
        position: absolute;
        left: -1px;
        right: -1px;
        bottom: -0.5rem;
        height: 0.5rem;
        background: radial-gradient(
            circle at 0.5rem 0,
            var(--ds-surface) 0.375rem,
            transparent 0.4rem
          )
          0 0 / 1rem 0.5rem repeat-x;
      }
      .ds-receipt__head {
        appearance: none;
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        width: 100%;
        padding: 0;
        border: 0;
        background: transparent;
        font: inherit;
        text-align: left;
        color: var(--ds-text);
        cursor: pointer;
      }
      .ds-receipt__head:focus-visible {
        outline: none;
        box-shadow: var(--ds-focus-ring);
        border-radius: var(--ds-radius-mark);
      }
      .ds-receipt__icon {
        flex: none;
        width: 2rem;
        height: 2rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ds-radius-control-sm);
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-receipt__titles {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .ds-receipt__title {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-bold);
      }
      .ds-receipt__meta {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--ds-text-sm);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text-muted);
      }
      .ds-receipt__stamp {
        flex: none;
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1);
        padding: 2px var(--ds-space-2);
        border: 1.5px solid var(--ds-accent);
        border-radius: var(--ds-radius-pill);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        white-space: nowrap;
        color: var(--ds-primary-soft-text);
        transform: rotate(-4deg);
        animation: ds-receipt-stamp var(--ds-dur-3) var(--ds-ease-spring);
      }
      .ds-receipt__chevron {
        flex: none;
        color: var(--ds-text-muted);
        transform: rotate(-90deg);
        transition: transform var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-receipt--open .ds-receipt__chevron {
        transform: rotate(0deg);
      }
      .ds-receipt__collapse {
        display: grid;
        grid-template-rows: 0fr;
        opacity: 0;
        margin-bottom: calc(-1 * var(--ds-space-3));
        transition:
          grid-template-rows var(--ds-dur-3) var(--ds-ease-in-out),
          opacity var(--ds-dur-2) var(--ds-ease-out),
          margin var(--ds-dur-3) var(--ds-ease-in-out);
      }
      .ds-receipt--open .ds-receipt__collapse {
        grid-template-rows: 1fr;
        opacity: 1;
        margin-bottom: 0;
      }
      .ds-receipt__clip {
        min-height: 0;
        overflow: hidden;
      }
      .ds-receipt__body {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-2);
      }
      .ds-receipt__rule {
        width: 100%;
        margin: 0;
        border: 0;
        border-top: 1.5px dashed var(--ds-border-strong);
      }
      .ds-receipt__cols {
        display: grid;
        grid-template-columns: 2.6ch minmax(0, 1fr) auto;
        column-gap: var(--ds-space-2);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--ds-text-meta);
      }
      .ds-receipt__cols-price {
        text-align: right;
      }
      .ds-receipt__lines {
        display: flex;
        flex-direction: column;
      }
      .ds-receipt__total {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--ds-space-2);
      }
      .ds-receipt__total-label {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--ds-text-muted);
      }
      .ds-receipt__total-value {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-2xl);
        font-weight: var(--ds-weight-bold);
        letter-spacing: -0.02em;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        color: var(--ds-text);
      }
      .ds-receipt__note {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: var(--ds-space-1) var(--ds-space-2);
        margin-top: calc(-1 * var(--ds-space-1));
        font-size: var(--ds-text-sm);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text-meta);
      }
      .ds-receipt__note--accent {
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-primary-soft-text);
      }
      @keyframes ds-receipt-stamp {
        from {
          opacity: 0;
          transform: rotate(-4deg) scale(1.6);
        }
        to {
          opacity: 1;
          transform: rotate(-4deg) scale(1);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-receipt__stamp {
          animation: none;
        }
        .ds-receipt__chevron,
        .ds-receipt__collapse {
          transition: none;
        }
      }
    `,
  ],
})
export class ReceiptComponent {
  private static nextId = 0;
  readonly bodyId = `receipt-body-${ReceiptComponent.nextId++}`;
  readonly icon = input<DsIconName>("cart");
  readonly title = input("");
  readonly meta = input("");
  readonly stamp = input("");
  readonly columns = input<ReceiptColumns | null>(null);
  readonly totalLabel = input("");
  readonly total = input("");
  readonly note = input("");
  readonly noteAside = input("");
  readonly noteAccent = input(false);
  readonly open = model(true);
}
