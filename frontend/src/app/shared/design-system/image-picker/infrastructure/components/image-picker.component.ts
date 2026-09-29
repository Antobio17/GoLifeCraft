import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  signal,
} from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { ImageCropperComponent } from "@shared/design-system/image-cropper/infrastructure/components/image-cropper.component";

@Component({
  selector: "ds-image-picker",
  imports: [IconComponent, ImageCropperComponent],
  template: `
    <div class="ds-image-picker">
      <button
        type="button"
        class="ds-image-picker__trigger"
        [class.is-filled]="!!imageUrl"
        [class.is-circle]="'circle' === shape"
        [class.is-placeholder]="!imageUrl && !!placeholder"
        [disabled]="disabled"
        [attr.aria-label]="triggerLabel"
        (click)="openPicker()"
      >
        <span class="ds-image-picker__frame">
          @if (imageUrl) {
            <img class="ds-image-picker__image" [src]="imageUrl" [alt]="alt" />
          } @else if (placeholder) {
            <span class="ds-image-picker__placeholder">{{ placeholder }}</span>
          } @else {
            <ds-icon name="camera" [size]="22" [stroke]="1.8" />
          }
        </span>
        <span class="ds-image-picker__badge" aria-hidden="true">
          <ds-icon name="pencil" [size]="12" [stroke]="2.6" />
        </span>
      </button>

      @if (imageUrl) {
        <button
          type="button"
          class="ds-image-picker__remove"
          [class.is-circle]="'circle' === shape"
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

    <ds-image-cropper
      [open]="!!pendingFile()"
      [file]="pendingFile()"
      [title]="cropTitle"
      [hint]="cropHint"
      [closeLabel]="cropCloseLabel"
      [confirmLabel]="cropConfirmLabel"
      [zoomLabel]="cropZoomLabel"
      (cropped)="onCropped($event)"
      (cancelled)="onCropCancelled()"
    />
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
        width: var(--ds-image-picker-size, 4rem);
        height: var(--ds-image-picker-size, 4rem);
        border-radius: var(--ds-radius-xl);
        background: var(--ds-surface-inset);
        border: 1px dashed var(--ds-border-strong);
        color: var(--ds-text-muted);
        display: block;
        padding: 0;
      }
      .ds-image-picker__trigger.is-filled {
        border-style: solid;
        border-color: var(--ds-image-picker-ring, var(--ds-border));
      }
      .ds-image-picker__trigger.is-circle {
        border-radius: 50%;
      }
      .ds-image-picker__trigger.is-circle .ds-image-picker__frame {
        border-radius: 50%;
      }
      .ds-image-picker__trigger.is-circle .ds-image-picker__badge {
        right: -0.125rem;
        bottom: -0.125rem;
        border-radius: var(--ds-radius-pill);
      }
      .ds-image-picker__trigger.is-placeholder {
        border: 1px solid
          var(--ds-image-picker-ring, var(--ds-primary-soft-border));
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-image-picker__placeholder {
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: var(--ds-text-2xl);
      }
      .ds-image-picker__frame {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: calc(var(--ds-radius-xl) - 1px);
        overflow: hidden;
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
        z-index: 1;
      }
      .ds-image-picker__remove.is-circle {
        top: -0.25rem;
        right: -0.25rem;
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
  host: {
    "[style.--ds-image-picker-size.px]": "size",
  },
})
export class ImagePickerComponent {
  @Input() imageUrl: string | null = null;
  @Input() shape: "square" | "circle" = "square";
  @Input() size: number | null = null;
  @Input() placeholder = "";
  @Input() disabled = false;
  @Input() alt = "";
  @Input() triggerLabel = "Subir una imagen";
  @Input() removeLabel = "Quitar la imagen";
  @Input() cropTitle = "Recorta la imagen";
  @Input() cropHint = "Arrastra y haz zoom. Se guardará cuadrada.";
  @Input() cropCloseLabel = "Cerrar";
  @Input() cropConfirmLabel = "Usar recorte";
  @Input() cropZoomLabel = "Zoom";

  @Output() picked = new EventEmitter<File>();
  @Output() cleared = new EventEmitter<void>();

  @ViewChild("fileInput") private fileInput?: ElementRef<HTMLInputElement>;

  readonly pendingFile = signal<File | null>(null);

  openPicker(): void {
    if (this.disabled) return;

    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    input.value = "";

    if (undefined === file) return;

    this.pendingFile.set(file);
  }

  onCropped(file: File): void {
    this.pendingFile.set(null);
    this.picked.emit(file);
  }

  onCropCancelled(): void {
    this.pendingFile.set(null);
  }
}
