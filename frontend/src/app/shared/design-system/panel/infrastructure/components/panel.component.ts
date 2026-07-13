import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-panel",
  standalone: true,
  template: `
    <article class="ds-panel" [class.ds-panel--brand]="brand">
      <div class="ds-panel__head">
        <div class="ds-panel__heading">
          <p class="ds-panel__title">{{ title }}</p>
          @if (subtitle) {
            <p class="ds-panel__subtitle">{{ subtitle }}</p>
          }
        </div>
        @if (figure) {
          <span class="ds-panel__figure">{{ figure }}</span>
        }
        <ng-content select="[slot='aside']"></ng-content>
      </div>
      <ng-content></ng-content>
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-panel {
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: 18px;
        padding: 14px;
        display: flex;
        flex-direction: column;
      }
      .ds-panel--brand {
        background: var(--ds-surface-brand);
        border-color: transparent;
        color: var(--ds-on-surface-brand);
        overflow: hidden;
      }
      :host-context([data-theme="dark"]) .ds-panel--brand {
        border-color: var(--ds-border-hairline);
      }
      .ds-panel__head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }
      .ds-panel__heading {
        min-width: 0;
      }
      .ds-panel__title {
        margin: 0;
        font-size: 12.5px;
        font-weight: 700;
        color: inherit;
      }
      .ds-panel__subtitle {
        margin: 1px 0 0;
        font-size: 10.5px;
        color: var(--ds-text-muted);
      }
      .ds-panel--brand .ds-panel__subtitle {
        color: color-mix(in srgb, var(--ds-on-surface-brand) 60%, transparent);
      }
      .ds-panel__figure {
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: 17px;
        color: inherit;
        white-space: nowrap;
      }
    `,
  ],
})
export class PanelComponent {
  @Input() title = "";
  @Input() subtitle = "";
  @Input() figure = "";
  @Input() brand = false;
}
