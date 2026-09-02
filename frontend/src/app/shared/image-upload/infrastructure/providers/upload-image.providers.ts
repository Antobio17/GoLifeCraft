import { Provider } from "@angular/core";
import { ImageResizerService } from "@shared/design-system/photo-capture/application/services/image-resizer.service";
import { UploadImagePort } from "@shared/image-upload/domain/ports/upload-image.port";
import { HttpUploadImageAdapter } from "@shared/image-upload/infrastructure/adapters/http-upload-image.adapter";
import { UploadImageService } from "@shared/image-upload/application/services/upload-image.service";

export class UploadImageProviders {
  static getProviders(): Provider[] {
    return [
      { provide: UploadImagePort, useClass: HttpUploadImageAdapter },
      {
        provide: UploadImageService,
        useFactory: (
          port: UploadImagePort,
          imageResizerService: ImageResizerService,
        ) => new UploadImageService(port, imageResizerService),
        deps: [UploadImagePort, ImageResizerService],
      },
    ];
  }
}
