import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { SpinnerComponent } from "../../../spinner/infrastructure/components/spinner.component";

@Component({
  selector: "ds-image-picker",
  imports: [IconComponent, SpinnerComponent],
  template: `
    <div class="ds-image-picker">
      <button
        type="button"
        class="ds-image-picker__trigger"
        [class.is-filled]="!!imageUrl"
        [disabled]="disabled || uploading"
        [attr.aria-label]="triggerLabel"
        (click)="openPicker()"
      >
        @if (uploading) {
          <ds-spinner size="1.375rem" />
        } @else if (imageUrl) {
          <img class="ds-image-picker__image" [src]="imageUrl" [alt]="alt" />
        } @else {
          <ds-icon name="camera" [size]="22" [stroke]="1.8" />
        }
        <span class="ds-image-picker__badge" aria-hidden="true">
          <ds-icon name="pencil" [size]="12" [stroke]="2.6" />
        </span>
      </button>

      @if (imageUrl && !uploading) {
        <button
          type="button"
          class="ds-image-picker__remove"
          [disabled]="disabled"
          [attr.aria-label]="removeLabel"
          (click)="cleared.emit()"
        >
          <ds-icon name="close" [size]="13" [stroke]="2.8" />
        </button>
      }

      <input
        #fileInput
        class="ds-image-picker__input"
        type="file"
        accept="image/*"
        (change)="onFileSelected($event)"
      />
    </div>
  `,
  styles: [
    `
      .ds-image-picker {
        position: relative;
        display: inline-flex;
      }
      .ds-image-picker__trigger {
        position: relative;
        appearance: none;
        cursor: pointer;
        width: 4rem;
        height: 4rem;
        border-radius: var(--ds-radius-xl);
        background: var(--ds-surface-inset);
        border: 1px dashed var(--ds-border-strong);
        color: var(--ds-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        overflow: hidden;
      }
      .ds-image-picker__trigger.is-filled {
        border-style: solid;
        border-color: var(--ds-border);
      }
      .ds-image-picker__trigger:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .ds-image-picker__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .ds-image-picker__badge {
        position: absolute;
        right: -0.3125rem;
        bottom: -0.3125rem;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: var(--ds-radius-md);
        background: var(--ds-primary);
        color: var(--ds-on-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 0.375rem rgba(0, 0, 0, 0.22);
      }
      .ds-image-picker__remove {
        position: absolute;
        top: -0.375rem;
        right: -0.375rem;
        width: 1.5rem;
        height: 1.5rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        border-radius: var(--ds-radius-pill);
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
      }
      .ds-image-picker__remove:disabled {
        opacity: 0.5;
        cursor: default;
      }
      .ds-image-picker__input {
        display: none;
      }
    `,
  ],
})
export class ImagePickerComponent {
  @Input() imageUrl: string | null = null;
  @Input() uploading = false;
  @Input() disabled = false;
  @Input() alt = "";
  @Input() triggerLabel = "Subir una imagen";
  @Input() removeLabel = "Quitar la imagen";

  @Output() picked = new EventEmitter<File>();
  @Output() cleared = new EventEmitter<void>();

  @ViewChild("fileInput") private fileInput?: ElementRef<HTMLInputElement>;

  openPicker(): void {
    if (this.disabled || this.uploading) return;

    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    input.value = "";

    if (undefined === file) return;

    this.picked.emit(file);
  }
}
