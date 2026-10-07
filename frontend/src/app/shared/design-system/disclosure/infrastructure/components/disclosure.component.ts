import { Component, input, model } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-disclosure",
  imports: [IconComponent],
  template: `
    <section class="ds-disc" [class.ds-disc--open]="open()">
      <button
        type="button"
        class="ds-disc__head"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="bodyId"
        (click)="open.set(!open())"
      >
        @if (icon()) {
          <ds-icon [name]="icon()!" [size]="18" [stroke]="2.2" />
        }
        <span class="ds-disc__title">{{ title() }}</span>
        @if (meta()) {
          <span class="ds-disc__meta">{{ meta() }}</span>
        }
        <ds-icon
          class="ds-disc__chevron"
          name="chevronDown"
          [size]="18"
          [stroke]="2.4"
        />
      </button>

      <div
        class="ds-disc__collapse"
        [id]="bodyId"
        [attr.inert]="open() ? null : ''"
        [attr.aria-hidden]="!open()"
      >
        <div class="ds-disc__clip">
          <div class="ds-disc__body"><ng-content /></div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-disc {
        --ds-pad: var(--ds-space-4);
        display: flex;
        flex-direction: column;
        padding: var(--ds-pad);
        border-radius: var(--ds-radius-surface);
        background: var(--ds-surface-inset);
      }
      .ds-disc__head {
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
        cursor: pointer;
        color: var(--ds-text);
      }
      .ds-disc__head:focus-visible {
        outline: none;
        box-shadow: var(--ds-focus-ring);
        border-radius: var(--ds-radius-mark);
      }
      .ds-disc__title {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-bold);
      }
      .ds-disc__meta {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--ds-text-sm);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text-muted);
      }
      .ds-disc__chevron {
        margin-left: auto;
        color: var(--ds-text-muted);
        transition: transform var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-disc--open .ds-disc__chevron {
        transform: rotate(180deg);
      }
      .ds-disc__collapse {
        display: grid;
        grid-template-rows: 0fr;
        opacity: 0;
        transition:
          grid-template-rows var(--ds-dur-3) var(--ds-ease-in-out),
          opacity var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-disc--open .ds-disc__collapse {
        grid-template-rows: 1fr;
        opacity: 1;
      }
      .ds-disc__clip {
        min-height: 0;
        overflow: hidden;
      }
      .ds-disc__body {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-3);
        padding: var(--ds-space-4) 2px 2px;
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-disc__chevron,
        .ds-disc__collapse {
          transition: none;
        }
      }
    `,
  ],
})
export class DisclosureComponent {
  private static nextId = 0;
  readonly bodyId = `disclosure-body-${DisclosureComponent.nextId++}`;
  readonly icon = input<DsIconName | null>(null);
  readonly title = input("");
  readonly meta = input("");
  readonly open = model(false);
}
