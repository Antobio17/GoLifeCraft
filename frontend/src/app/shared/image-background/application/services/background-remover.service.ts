import { Injectable, inject } from "@angular/core";
import { ImageDecoderService } from "@shared/image-decoder/application/services/image-decoder.service";
import { DecodedImage } from "@shared/image-decoder/domain/models/decoded-image.model";

const MAX_SIDE = 640;
const OUTPUT_TYPE = "image/png";
const BACKGROUND_MIN_CHANNEL = 218;
const BACKGROUND_MAX_CHROMA = 26;
const FEATHER_MIN_CHANNEL = 196;
const MIN_BACKGROUND_RATIO = 0.06;

@Injectable({ providedIn: "root" })
export class BackgroundRemoverService {
  private imageDecoderService = inject(ImageDecoderService);

  async removeWhiteBackground(blob: Blob): Promise<Blob> {
    const source = await this.imageDecoderService.decode(blob);

    if (null === source) {
      return blob;
    }

    const canvas = this.paint(source);
    this.imageDecoderService.release(source);

    if (null === canvas) {
      return blob;
    }

    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (null === context) {
      return blob;
    }

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const mask = this.markBackground(imageData);

    if (this.coverage(mask) < MIN_BACKGROUND_RATIO) {
      return blob;
    }

    this.cutOut(imageData, mask);
    context.putImageData(imageData, 0, 0);

    return (await this.toBlob(canvas)) ?? blob;
  }

  private paint(source: DecodedImage): HTMLCanvasElement | null {
    const scale = Math.min(1, MAX_SIDE / Math.max(source.width, source.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(source.width * scale);
    canvas.height = Math.round(source.height * scale);

    if (0 === canvas.width || 0 === canvas.height) {
      return null;
    }

    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (null === context) {
      return null;
    }

    context.drawImage(source, 0, 0, canvas.width, canvas.height);

    return canvas;
  }

  private markBackground(imageData: ImageData): Uint8Array {
    const { data, width, height } = imageData;
    const mask = new Uint8Array(width * height);
    const stack = new Int32Array(width * height);
    let top = 0;

    for (let x = 0; x < width; x++) {
      top = this.stack(stack, top, mask, data, x);
      top = this.stack(stack, top, mask, data, (height - 1) * width + x);
    }

    for (let y = 0; y < height; y++) {
      top = this.stack(stack, top, mask, data, y * width);
      top = this.stack(stack, top, mask, data, y * width + width - 1);
    }

    while (top > 0) {
      top -= 1;
      top = this.stackNeighbours(stack, top, mask, data, width, height);
    }

    return mask;
  }

  private stackNeighbours(
    stack: Int32Array,
    top: number,
    mask: Uint8Array,
    data: Uint8ClampedArray,
    width: number,
    height: number,
  ): number {
    const index = stack[top];
    const x = index % width;
    const y = (index - x) / width;
    let next = top;

    if (x > 0) {
      next = this.stack(stack, next, mask, data, index - 1);
    }

    if (x < width - 1) {
      next = this.stack(stack, next, mask, data, index + 1);
    }

    if (y > 0) {
      next = this.stack(stack, next, mask, data, index - width);
    }

    if (y < height - 1) {
      next = this.stack(stack, next, mask, data, index + width);
    }

    return next;
  }

  private stack(
    stack: Int32Array,
    top: number,
    mask: Uint8Array,
    data: Uint8ClampedArray,
    index: number,
  ): number {
    if (1 === mask[index]) {
      return top;
    }

    if (!this.isBackground(data, index * 4)) {
      return top;
    }

    mask[index] = 1;
    stack[top] = index;

    return top + 1;
  }

  private isBackground(data: Uint8ClampedArray, offset: number): boolean {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const min = Math.min(red, green, blue);
    const max = Math.max(red, green, blue);

    return min >= BACKGROUND_MIN_CHANNEL && max - min <= BACKGROUND_MAX_CHROMA;
  }

  private coverage(mask: Uint8Array): number {
    let marked = 0;

    for (let index = 0; index < mask.length; index++) {
      marked += mask[index];
    }

    return marked / mask.length;
  }

  private cutOut(imageData: ImageData, mask: Uint8Array): void {
    const { data, width, height } = imageData;

    for (let index = 0; index < mask.length; index++) {
      const offset = index * 4;

      if (1 === mask[index]) {
        data[offset + 3] = 0;
        continue;
      }

      if (!this.touchesBackground(mask, index, width, height)) {
        continue;
      }

      data[offset + 3] = this.featherAlpha(data, offset);
    }
  }

  private touchesBackground(
    mask: Uint8Array,
    index: number,
    width: number,
    height: number,
  ): boolean {
    const x = index % width;
    const y = (index - x) / width;

    if (x > 0 && 1 === mask[index - 1]) {
      return true;
    }

    if (x < width - 1 && 1 === mask[index + 1]) {
      return true;
    }

    if (y > 0 && 1 === mask[index - width]) {
      return true;
    }

    return y < height - 1 && 1 === mask[index + width];
  }

  private featherAlpha(data: Uint8ClampedArray, offset: number): number {
    const min = Math.min(data[offset], data[offset + 1], data[offset + 2]);

    if (min <= FEATHER_MIN_CHANNEL) {
      return 255;
    }

    const ratio =
      (BACKGROUND_MIN_CHANNEL - min) /
      (BACKGROUND_MIN_CHANNEL - FEATHER_MIN_CHANNEL);

    return Math.round(255 * Math.max(0, ratio));
  }

  private toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
    return new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob), OUTPUT_TYPE),
    );
  }
}
