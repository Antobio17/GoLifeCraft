import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-panel",
  template: `
    <article
      class="ds-panel"
      [class.ds-panel--brand]="brand"
      [class.ds-panel--glass]="glass"
    >
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
        border-radius: var(--ds-radius-surface);
        padding: var(--ds-space-3);
        display: flex;
        flex-direction: column;
      }
      .ds-panel--brand {
        --ds-accent: var(--ds-accent-on-chart);
        --ds-on-accent: var(--ds-on-accent-on-chart);
        --ds-primary: var(--ds-accent-on-chart);
        --ds-on-primary: var(--ds-on-accent-on-chart);
        background: var(--ds-surface-chart);
        color: var(--ds-on-surface-chart);
        overflow: hidden;
      }
      .ds-panel--glass {
        --ds-surface: var(--ds-sheet-surface);
        --ds-surface-inset: var(--ds-sheet-surface-inset);
        background: var(--ds-hero-bg);
        border-color: var(--ds-sheet-border);
        box-shadow: var(--ds-hero-shadow);
        padding: var(--ds-space-4);
      }
      .ds-panel__head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--ds-space-3);
      }
      .ds-panel__heading {
        min-width: 0;
      }
      .ds-panel__title {
        margin: 0;
        font-size: var(--ds-text-base);
        font-weight: 700;
        color: inherit;
      }
      .ds-panel__subtitle {
        margin: 1px 0 0;
        font-size: var(--ds-text-xs);
        color: var(--ds-text-muted);
      }
      .ds-panel--brand .ds-panel__subtitle {
        color: color-mix(in srgb, var(--ds-on-surface-brand) 60%, transparent);
      }
      .ds-panel__figure {
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: var(--ds-text-xl);
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
  @Input() glass = false;
}
