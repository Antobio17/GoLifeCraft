import { Component, input } from "@angular/core";

@Component({
  selector: "ds-module-card",
  template: `
    <section
      class="ds-mcard"
      [class.ds-mcard--hero]="hero()"
      [attr.aria-label]="eyebrow() || null"
    >
      @if (eyebrow()) {
        <header class="ds-mcard__head">
          <span class="ds-mcard__eyebrow">{{ eyebrow() }}</span>
          <ng-content select="[slot='aside']" />
        </header>
      }
      <ng-content />
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-mcard {
        --ds-pad: var(--ds-space-3);
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-3);
        padding: var(--ds-pad);
        border-radius: var(--ds-radius-surface);
        border: 1px solid var(--ds-border);
        background: var(--ds-surface);
      }
      .ds-mcard--hero {
        --ds-pad: var(--ds-space-4);
        --ds-surface: var(--ds-sheet-surface);
        --ds-surface-inset: var(--ds-sheet-surface-inset);
        background: var(--ds-hero-bg);
        border-color: var(--ds-sheet-border);
        box-shadow: var(--ds-hero-shadow);
      }
      @media (min-width: 768px) {
        .ds-mcard--hero {
          --ds-pad: var(--ds-space-5);
          gap: var(--ds-space-4);
        }
      }
      .ds-mcard__head {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        min-height: 1.25rem;
      }
      .ds-mcard__eyebrow {
        flex: 1 1 auto;
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-2);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--ds-module-text, var(--ds-primary));
      }
      .ds-mcard__eyebrow::before {
        content: "";
        flex: none;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-module, var(--ds-primary));
        box-shadow: 0 0 0 0.1875rem
          color-mix(
            in srgb,
            var(--ds-module, var(--ds-primary)) 20%,
            transparent
          );
      }
    `,
  ],
})
export class ModuleCardComponent {
  readonly eyebrow = input("");
  readonly hero = input(false);
}
