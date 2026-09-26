import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-avatar",
  template: `<span class="ds-avatar">
    @if (imageUrl) {
      <img class="ds-avatar__image" [src]="imageUrl" alt="" />
    } @else {
      {{ initial }}
    }
  </span>`,
  styles: [
    `
      :host {
        display: inline-flex;
        flex: none;
      }
      .ds-avatar {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--ds-avatar-size, 2.5rem);
        height: var(--ds-avatar-size, 2.5rem);
        border-radius: 50%;
        border: 1px solid var(--ds-avatar-border, transparent);
        background: var(--ds-avatar-bg, var(--ds-primary-soft));
        color: var(--ds-avatar-fg, var(--ds-primary-soft-text));
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: var(--ds-avatar-font, var(--ds-text-lg));
        overflow: hidden;
      }
      .ds-avatar__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      :host-context([data-theme="dark"]) .ds-avatar {
        font-weight: 700;
      }
    `,
  ],
  host: {
    "[style.--ds-avatar-size.px]": "size",
  },
})
export class AvatarComponent {
  @Input() initial = "";
  @Input() size = 40;
  @Input() imageUrl: string | null = null;
}
