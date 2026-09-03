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

  async function readPixels(blob: Blob): Promise<ImageData> {
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const context = canvas.getContext("2d")!;
    context.drawImage(bitmap, 0, 0);

    return context.getImageData(0, 0, canvas.width, canvas.height);
  }

  async function alphaAt(blob: Blob, x: number, y: number): Promise<number> {
    const pixels = await readPixels(blob);

    return pixels.data[(y * pixels.width + x) * 4 + 3];
  }

  async function alphaAtRatio(
    blob: Blob,
    ratioX: number,
    ratioY: number,
  ): Promise<number> {
    const pixels = await readPixels(blob);
    const x = Math.round(ratioX * (pixels.width - 1));
    const y = Math.round(ratioY * (pixels.height - 1));

    return pixels.data[(y * pixels.width + x) * 4 + 3];
  }

  async function clearRatio(blob: Blob): Promise<number> {
    const pixels = await readPixels(blob);
    let clear = 0;

    for (let offset = 3; offset < pixels.data.length; offset += 4) {
      clear += 0 === pixels.data[offset] ? 1 : 0;
    }

    return clear / (pixels.data.length / 4);
  }

  function loadPhoto(name: string): Promise<Blob> {
    return fetch(`/test-assets/background/${name}.jpg`).then((response) =>
      response.blob(),
    );
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

  it("recorta el fondo de una bandeja de plastico transparente", async () => {
    const source = await loadPhoto("burger-meat");

    const result = await service.removeWhiteBackground(source);

    expect(await alphaAtRatio(result, 0.02, 0.02)).toBe(0);
    expect(await alphaAtRatio(result, 0.5, 0.98)).toBe(0);
    expect(await alphaAtRatio(result, 0.5, 0.45)).toBe(255);
    expect(await alphaAtRatio(result, 0.25, 0.6)).toBe(255);
    expect(await alphaAtRatio(result, 0.08, 0.5)).toBe(255);
  });

  it("conserva el blanco del envase de una bolsa sobre fondo blanco", async () => {
    const source = await loadPhoto("brocoli");

    const result = await service.removeWhiteBackground(source);

    expect(await alphaAtRatio(result, 0.02, 0.02)).toBe(0);
    expect(await alphaAtRatio(result, 0.98, 0.5)).toBe(0);
    expect(await alphaAtRatio(result, 0.5, 0.1)).toBe(255);
    expect(await alphaAtRatio(result, 0.5, 0.92)).toBe(255);
    expect(await alphaAtRatio(result, 0.35, 0.45)).toBe(255);
  });

  it("conserva una caja de color claro sobre fondo blanco", async () => {
    const source = await loadPhoto("soja");

    const result = await service.removeWhiteBackground(source);

    expect(await alphaAtRatio(result, 0.02, 0.02)).toBe(0);
    expect(await alphaAtRatio(result, 0.5, 0.02)).toBe(0);
    expect(await alphaAtRatio(result, 0.5, 0.5)).toBe(255);
    expect(await alphaAtRatio(result, 0.3, 0.25)).toBe(255);
    expect(await alphaAtRatio(result, 0.9, 0.87)).toBe(255);
  });

  it("recorta una porcion razonable de cada foto real", async () => {
    for (const name of ["burger-meat", "brocoli", "soja"]) {
      const result = await service.removeWhiteBackground(await loadPhoto(name));
      const ratio = await clearRatio(result);

      expect(ratio).toBeGreaterThan(0.15);
      expect(ratio).toBeLessThan(0.8);
    }
  });
});
