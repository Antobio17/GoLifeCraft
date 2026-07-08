import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-page-heading",
  standalone: true,
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
        gap: 14px;
        flex-wrap: wrap;
      }
      .ds-page-heading__tile {
        width: 52px;
        height: 52px;
        border-radius: 16px;
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
        gap: 10px;
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
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        color: var(--ds-on-accent);
        background: var(--ds-accent);
        border-radius: var(--ds-radius-pill);
        padding: 2px 9px;
      }
      .ds-page-heading__subtitle {
        margin: 0;
        font-size: var(--ds-text-label);
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
