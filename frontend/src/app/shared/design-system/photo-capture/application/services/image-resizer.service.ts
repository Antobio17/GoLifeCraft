import { Injectable, inject } from "@angular/core";
import { ImageDecoderService } from "@shared/image-decoder/application/services/image-decoder.service";

const DEFAULT_MAX_SIDE = 1024;
const QUALITY = 0.82;
const OUTPUT_TYPE = "image/jpeg";

@Injectable({ providedIn: "root" })
export class ImageResizerService {
  private imageDecoderService = inject(ImageDecoderService);

  async resize(file: File, maxSide = DEFAULT_MAX_SIDE): Promise<File> {
    const source = await this.imageDecoderService.decode(file);

    if (null === source) {
      return file;
    }

    const scale = Math.min(1, maxSide / Math.max(source.width, source.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(source.width * scale);
    canvas.height = Math.round(source.height * scale);

    const context = canvas.getContext("2d");

    if (null === context) {
      this.imageDecoderService.release(source);

      return file;
    }

    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    this.imageDecoderService.release(source);

    const blob = await this.toBlob(canvas);

    if (null === blob) {
      return file;
    }

    return new File([blob], this.rename(file.name), { type: OUTPUT_TYPE });
  }

  private toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
    return new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob), OUTPUT_TYPE, QUALITY),
    );
  }

  private rename(name: string): string {
    const withoutExtension = name.replace(/\.[^.]+$/, "");

    return `${withoutExtension || "photo"}.jpg`;
  }
}
