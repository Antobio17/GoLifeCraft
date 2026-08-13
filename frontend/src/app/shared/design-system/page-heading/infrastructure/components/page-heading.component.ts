import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-page-heading",
  template: `
    <header class="ds-page-heading">
      <div class="ds-page-heading__tile">
        <ng-content select="[slot=icon]"></ng-content>
      </div>
      <div class="ds-page-heading__text">
        <div class="ds-page-heading__title-row">
          <h1 class="ds-page-heading__title">{{ title }}</h1>
          @if (count !== null && count !== undefined) {
            <span class="ds-page-heading__count">{{ count }}</span>
          }
        </div>
        @if (subtitle) {
          <p class="ds-page-heading__subtitle">{{ subtitle }}</p>
        }
      </div>
      <div class="ds-page-heading__action">
        <ng-content select="[slot=action]"></ng-content>
      </div>
    </header>
  `,
  styles: [
    `
      .ds-page-heading {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        flex-wrap: wrap;
      }
      .ds-page-heading__tile {
        width: 3.25rem;
        height: 3.25rem;
        border-radius: var(--ds-radius-xl);
        background: var(--ds-surface-brand);
        color: var(--ds-accent);
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        box-shadow: var(--ds-shadow-card);
      }
      .ds-page-heading__text {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        flex: 1 1 auto;
      }
      .ds-page-heading__title-row {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
      }
      .ds-page-heading__title {
        margin: 0;
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: var(--ds-text-2xl);
        letter-spacing: -0.02em;
        color: var(--ds-text);
        line-height: 1.15;
      }
      .ds-page-heading__count {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-extrabold);
        color: var(--ds-on-accent);
        background: var(--ds-accent);
        border-radius: var(--ds-radius-pill);
        padding: 2px var(--ds-space-2);
      }
      .ds-page-heading__subtitle {
        margin: 0;
        font-size: var(--ds-text-md);
        color: var(--ds-text-muted);
      }
      .ds-page-heading__action {
        margin-left: auto;
        display: flex;
        align-items: center;
      }
      .ds-page-heading__action:empty {
        display: none;
      }
      @media (max-width: 520px) {
        .ds-page-heading__action {
          margin-left: 0;
          flex: 1 1 100%;
        }
      }
    `,
  ],
})
export class PageHeadingComponent {
  @Input() title = "";
  @Input() subtitle = "";
  @Input() count: number | string | null = null;
}
