import { TestBed } from "@angular/core/testing";
import { BackgroundRemoverService } from "./background-remover.service";

describe("BackgroundRemoverService", () => {
  let service: BackgroundRemoverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackgroundRemoverService);
  });

  function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob!), "image/png"),
    );
  }

  function buildCanvas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;

    return canvas;
  }

  function buildProductOnWhite(): Promise<Blob> {
    const canvas = buildCanvas();
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 200, 200);
    context.fillStyle = "#2b7a3d";
    context.fillRect(60, 60, 80, 80);

    return toBlob(canvas);
  }

  function buildLabelledProductOnWhite(): Promise<Blob> {
    const canvas = buildCanvas();
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 200, 200);
    context.fillStyle = "#2b7a3d";
    context.fillRect(50, 50, 100, 100);
    context.fillStyle = "#ffffff";
    context.fillRect(80, 80, 40, 40);

    return toBlob(canvas);
  }

  function buildPhotoWithoutWhite(): Promise<Blob> {
    const canvas = buildCanvas();
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#6b4b2a";
    context.fillRect(0, 0, 200, 200);
    context.fillStyle = "#2b7a3d";
    context.fillRect(40, 40, 120, 120);

    return toBlob(canvas);
  }

  async function alphaAt(blob: Blob, x: number, y: number): Promise<number> {
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const context = canvas.getContext("2d")!;
    context.drawImage(bitmap, 0, 0);

    return context.getImageData(x, y, 1, 1).data[3];
  }

  it("deja transparente el fondo blanco y mantiene el producto", async () => {
    const source = await buildProductOnWhite();

    const result = await service.removeWhiteBackground(source);

    expect(await alphaAt(result, 4, 4)).toBe(0);
    expect(await alphaAt(result, 196, 196)).toBe(0);
    expect(await alphaAt(result, 100, 100)).toBe(255);
  });

  it("no agujerea las zonas blancas encerradas por el producto", async () => {
    const source = await buildLabelledProductOnWhite();

    const result = await service.removeWhiteBackground(source);

    expect(await alphaAt(result, 4, 4)).toBe(0);
    expect(await alphaAt(result, 100, 100)).toBe(255);
  });

  it("devuelve la imagen original cuando no hay fondo blanco", async () => {
    const source = await buildPhotoWithoutWhite();

    const result = await service.removeWhiteBackground(source);

    expect(result).toBe(source);
  });
});
