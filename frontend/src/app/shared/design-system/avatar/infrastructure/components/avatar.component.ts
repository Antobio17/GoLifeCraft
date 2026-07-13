import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-avatar",
  standalone: true,
  template: `<span class="ds-avatar">{{ initial }}</span>`,
  styles: [
    `
      :host {
        display: inline-flex;
        flex: none;
      }
      .ds-avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--ds-avatar-size, 40px);
        height: var(--ds-avatar-size, 40px);
        border-radius: 50%;
        background: var(--ds-avatar-bg, var(--ds-surface-brand));
        color: var(--ds-avatar-fg, var(--ds-accent));
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: var(--ds-avatar-font, 15px);
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
}
