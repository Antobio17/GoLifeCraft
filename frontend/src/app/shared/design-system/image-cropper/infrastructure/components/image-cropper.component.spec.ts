import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ImageCropperComponent } from "./image-cropper.component";

describe("ImageCropperComponent", () => {
  let fixture: ComponentFixture<ImageCropperComponent>;
  let component: ImageCropperComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [ImageCropperComponent] });

    fixture = TestBed.createComponent(ImageCropperComponent);
    component = fixture.componentInstance;
  });

  function buildFile(width: number, height: number): Promise<File> {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d")!;
    context.fillStyle = "#00ff00";
    context.fillRect(0, 0, width, height);

    return new Promise((resolve) =>
      canvas.toBlob(
        (blob) =>
          resolve(new File([blob!], "source.png", { type: blob!.type })),
        "image/png",
      ),
    );
  }

  async function openWith(file: File): Promise<void> {
    component.open = true;
    component.file = file;
    fixture.detectChanges();

    while (!component.ready()) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();
    }
  }

  it("devuelve una imagen cuadrada de una foto apaisada", async () => {
    await openWith(await buildFile(400, 200));

    const cropped = await new Promise<File>((resolve) => {
      component.cropped.subscribe(resolve);
      component.confirm();
    });
    const bitmap = await createImageBitmap(cropped);

    expect(bitmap.width).toBe(bitmap.height);
    expect(bitmap.width).toBe(200);
  });

  it("devuelve una imagen cuadrada de una foto vertical con zoom", async () => {
    await openWith(await buildFile(300, 900));

    component.zoomControl.setValue(2);
    fixture.detectChanges();

    const cropped = await new Promise<File>((resolve) => {
      component.cropped.subscribe(resolve);
      component.confirm();
    });
    const bitmap = await createImageBitmap(cropped);

    expect(bitmap.width).toBe(bitmap.height);
    expect(bitmap.width).toBe(150);
  });

  it("no emite recorte sin imagen cargada", async () => {
    const emitted = jasmine.createSpy("cropped");
    component.cropped.subscribe(emitted);

    await component.confirm();

    expect(emitted).not.toHaveBeenCalled();
  });
});
