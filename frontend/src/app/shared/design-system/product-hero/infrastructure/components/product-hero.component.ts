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
        border-radius: 1.25rem;
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
        border-radius: 0.5625rem;
        padding: 0.3125rem 0.625rem;
        font-family: var(--ds-font-display);
        font-weight: 700;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class ProductHeroComponent {
  @Input() emoji = "";
  @Input() price: string | null = null;
  @Input() badge: string | null = null;
}
