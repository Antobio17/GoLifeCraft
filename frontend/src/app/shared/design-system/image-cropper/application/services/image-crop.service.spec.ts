import { TestBed } from "@angular/core/testing";
import { ImageCropService } from "./image-crop.service";

describe("ImageCropService", () => {
  let service: ImageCropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageCropService);
  });

  function buildFile(width: number, height: number): Promise<File> {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d")!;
    context.fillStyle = "#ff0000";
    context.fillRect(0, 0, width / 2, height);
    context.fillStyle = "#0000ff";
    context.fillRect(width / 2, 0, width / 2, height);

    return new Promise((resolve) =>
      canvas.toBlob(
        (blob) =>
          resolve(new File([blob!], "source.png", { type: blob!.type })),
        "image/png",
      ),
    );
  }

  async function dominantChannelAt(
    file: File,
    x: number,
    y: number,
  ): Promise<string> {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0);

    const [red, , blue] = canvas
      .getContext("2d")!
      .getImageData(x, y, 1, 1).data;

    return red > blue ? "red" : "blue";
  }

  it("recorta un cuadrado del area pedida", async () => {
    const source = await buildFile(200, 100);

    const cropped = await service.cropToSquare(source, {
      x: 100,
      y: 0,
      size: 100,
    });
    const bitmap = await createImageBitmap(cropped);

    expect(bitmap.width).toBe(100);
    expect(bitmap.height).toBe(100);
    expect(await dominantChannelAt(cropped, 50, 50)).toBe("blue");
  });

  it("mantiene el area dentro de la imagen cuando se pide de mas", async () => {
    const source = await buildFile(200, 100);

    const cropped = await service.cropToSquare(source, {
      x: -50,
      y: -50,
      size: 400,
    });
    const bitmap = await createImageBitmap(cropped);

    expect(bitmap.width).toBe(100);
    expect(bitmap.height).toBe(100);
    expect(await dominantChannelAt(cropped, 20, 50)).toBe("red");
  });

  it("limita el lado de salida a 1024 px", async () => {
    const source = await buildFile(2400, 2400);

    const cropped = await service.cropToSquare(source, {
      x: 0,
      y: 0,
      size: 2400,
    });
    const bitmap = await createImageBitmap(cropped);

    expect(bitmap.width).toBe(1024);
    expect(bitmap.height).toBe(1024);
  });
});
