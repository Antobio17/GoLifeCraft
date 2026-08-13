import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-product-hero",
  template: `
    <div class="ds-product-hero">
      <span class="ds-product-hero__emoji">{{ emoji }}</span>
      @if (price) {
        <span class="ds-product-hero__price">{{ price }}</span>
      } @else if (badge) {
        <span class="ds-product-hero__price">{{ badge }}</span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-product-hero {
        position: relative;
        height: 7.375rem;
        border-radius: var(--ds-radius-xl);
        background: var(--ds-surface-inset);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3.25rem;
      }
      .ds-product-hero__price {
        position: absolute;
        bottom: 0.625rem;
        right: 0.625rem;
        background: var(--ds-primary);
        color: var(--ds-on-primary);
        border-radius: var(--ds-radius-md);
        padding: var(--ds-space-1) var(--ds-space-2);
        font-family: var(--ds-font-display);
        font-weight: 700;
        font-size: var(--ds-text-md);
      }
    `,
  ],
})
export class ProductHeroComponent {
  @Input() emoji = "";
  @Input() price: string | null = null;
  @Input() badge: string | null = null;
}
