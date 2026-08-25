import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  computed,
  inject,
  signal,
} from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { CapturedPhoto } from "../../domain/models/captured-photo.model";
import { ImageResizerService } from "../../application/services/image-resizer.service";

@Component({
  selector: "ds-photo-capture",
  imports: [IconComponent],
  template: `
    <div class="ds-photo-capture">
      <div class="ds-photo-capture__grid">
        @for (photo of photos(); track photo.url) {
          <div class="ds-photo-capture__item">
            <img class="ds-photo-capture__image" [src]="photo.url" alt="" />
            <button
              type="button"
              class="ds-photo-capture__remove"
              [attr.aria-label]="removeLabel"
              [disabled]="disabled"
              (click)="remove(photo)"
            >
              <ds-icon name="close" [size]="13" [stroke]="2.8" />
            </button>
          </div>
        }

        @if (canAddMore()) {
          <button
            type="button"
            class="ds-photo-capture__add"
            [disabled]="disabled || preparing()"
            (click)="openPicker()"
          >
            <ds-icon name="camera" [size]="22" [stroke]="1.8" />
            <span class="ds-photo-capture__add-label">{{ addLabel }}</span>
          </button>
        }
      </div>

      @if (hint) {
        <p class="ds-photo-capture__hint">{{ hint }}</p>
      }

      <input
        #fileInput
        class="ds-photo-capture__input"
        type="file"
        accept="image/*"
        multiple
        (change)="onFilesSelected($event)"
      />
    </div>
  `,
  styles: [
    `
      .ds-photo-capture {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-2);
      }
      .ds-photo-capture__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
        gap: var(--ds-space-2);
      }
      .ds-photo-capture__item {
        position: relative;
        aspect-ratio: 1;
        border-radius: var(--ds-radius-lg);
        overflow: hidden;
        background: var(--ds-surface-alt);
        border: 1px solid var(--ds-border);
      }
      .ds-photo-capture__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .ds-photo-capture__remove {
        position: absolute;
        top: var(--ds-space-1);
        right: var(--ds-space-1);
        width: 1.5rem;
        height: 1.5rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        border-radius: var(--ds-radius-pill);
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
      }
      .ds-photo-capture__remove:disabled {
        opacity: 0.5;
        cursor: default;
      }
      .ds-photo-capture__add {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--ds-space-1);
        cursor: pointer;
        color: var(--ds-text-muted);
        background: var(--ds-surface-alt);
        border: 1px dashed var(--ds-border-strong);
        border-radius: var(--ds-radius-lg);
        transition: border-color var(--ds-transition-fast);
      }
      .ds-photo-capture__add:hover:not(:disabled) {
        border-color: var(--ds-primary);
        color: var(--ds-primary);
      }
      .ds-photo-capture__add:disabled {
        opacity: 0.6;
        cursor: default;
      }
      .ds-photo-capture__add-label {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-medium);
        text-align: center;
        padding: 0 var(--ds-space-1);
      }
      .ds-photo-capture__hint {
        margin: 0;
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
      }
      .ds-photo-capture__input {
        display: none;
      }
    `,
  ],
})
export class PhotoCaptureComponent {
  private imageResizer = inject(ImageResizerService);
  private destroyRef = inject(DestroyRef);

  @Input() max = 3;
  @Input() addLabel = "";
  @Input() hint = "";
  @Input() removeLabel = "";
  @Input() disabled = false;

  @Output() photosChange = new EventEmitter<File[]>();

  @ViewChild("fileInput") private fileInput?: ElementRef<HTMLInputElement>;

  readonly photos = signal<CapturedPhoto[]>([]);
  readonly preparing = signal(false);
  readonly canAddMore = computed(() => this.photos().length < this.max);

  constructor() {
    this.destroyRef.onDestroy(() => this.revokeAll());
  }

  openPicker(): void {
    this.fileInput?.nativeElement.click();
  }

  async onFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    input.value = "";

    if (0 === selected.length) {
      return;
    }

    this.preparing.set(true);

    const room = this.max - this.photos().length;
    const prepared: CapturedPhoto[] = [];

    for (const file of selected.slice(0, room)) {
      const resized = await this.imageResizer.resize(file);
      prepared.push({ file: resized, url: URL.createObjectURL(resized) });
    }

    this.photos.update((photos) => [...photos, ...prepared]);
    this.preparing.set(false);
    this.emit();
  }

  remove(photo: CapturedPhoto): void {
    URL.revokeObjectURL(photo.url);
    this.photos.update((photos) => photos.filter((item) => item !== photo));
    this.emit();
  }

  private emit(): void {
    this.photosChange.emit(this.photos().map((photo) => photo.file));
  }

  private revokeAll(): void {
    this.photos().forEach((photo) => URL.revokeObjectURL(photo.url));
  }
}
