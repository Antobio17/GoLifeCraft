import { Injectable, inject } from "@angular/core";
import { ImageDecoderService } from "@shared/image-decoder/application/services/image-decoder.service";
import { CropArea } from "@shared/design-system/image-cropper/domain/models/crop-area.model";

const MAX_SIDE = 1024;
const QUALITY = 0.86;
const OUTPUT_TYPE = "image/jpeg";

@Injectable({ providedIn: "root" })
export class ImageCropService {
  private imageDecoderService = inject(ImageDecoderService);

  async cropToSquare(file: File, area: CropArea): Promise<File> {
    const source = await this.imageDecoderService.decode(file);

    if (null === source) {
      return file;
    }

    const safeArea = this.clamp(area, source.width, source.height);
    const side = Math.max(1, Math.min(MAX_SIDE, Math.round(safeArea.size)));
    const canvas = document.createElement("canvas");
    canvas.width = side;
    canvas.height = side;

    const context = canvas.getContext("2d");

    if (null === context) {
      this.imageDecoderService.release(source);

      return file;
    }

    context.drawImage(
      source,
      safeArea.x,
      safeArea.y,
      safeArea.size,
      safeArea.size,
      0,
      0,
      side,
      side,
    );
    this.imageDecoderService.release(source);

    const blob = await this.toBlob(canvas);

    if (null === blob) {
      return file;
    }

    return new File([blob], this.rename(file.name), { type: OUTPUT_TYPE });
  }

  private clamp(area: CropArea, width: number, height: number): CropArea {
    const size = Math.max(1, Math.min(area.size, width, height));

    return {
      x: Math.min(Math.max(area.x, 0), width - size),
      y: Math.min(Math.max(area.y, 0), height - size),
      size,
    };
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
