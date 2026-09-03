import { Injectable } from "@angular/core";
import { DecodedImage } from "@shared/image-decoder/domain/models/decoded-image.model";

@Injectable({ providedIn: "root" })
export class ImageDecoderService {
  async decode(file: Blob): Promise<DecodedImage | null> {
    try {
      return await createImageBitmap(file);
    } catch {
      return this.decodeWithImageElement(file);
    }
  }

  release(source: DecodedImage): void {
    if (!(source instanceof ImageBitmap)) return;

    source.close();
  }

  private decodeWithImageElement(file: Blob): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      image.src = url;
    });
  }
}
