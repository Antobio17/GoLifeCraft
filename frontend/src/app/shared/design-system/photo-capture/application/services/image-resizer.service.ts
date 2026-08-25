import { Injectable } from "@angular/core";

const MAX_SIDE = 1024;
const QUALITY = 0.82;
const OUTPUT_TYPE = "image/jpeg";

@Injectable({ providedIn: "root" })
export class ImageResizerService {
  async resize(file: File): Promise<File> {
    const source = await this.decode(file);

    if (null === source) {
      return file;
    }

    const scale = Math.min(1, MAX_SIDE / Math.max(source.width, source.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(source.width * scale);
    canvas.height = Math.round(source.height * scale);

    const context = canvas.getContext("2d");

    if (null === context) {
      return file;
    }

    context.drawImage(source, 0, 0, canvas.width, canvas.height);

    const blob = await this.toBlob(canvas);

    if (null === blob) {
      return file;
    }

    return new File([blob], this.rename(file.name), { type: OUTPUT_TYPE });
  }

  private async decode(
    file: File,
  ): Promise<HTMLImageElement | ImageBitmap | null> {
    try {
      return await createImageBitmap(file);
    } catch {
      return this.decodeWithImageElement(file);
    }
  }

  private decodeWithImageElement(file: File): Promise<HTMLImageElement | null> {
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
