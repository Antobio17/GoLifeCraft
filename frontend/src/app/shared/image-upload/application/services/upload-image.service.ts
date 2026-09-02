import { Observable, from, map, switchMap } from "rxjs";
import { ImageResizerService } from "@shared/design-system/photo-capture/application/services/image-resizer.service";
import { ImageFolder } from "@shared/image-upload/domain/models/image-folder.enum";
import { UploadImagePort } from "@shared/image-upload/domain/ports/upload-image.port";

export class UploadImageService {
  constructor(
    private uploadImagePort: UploadImagePort,
    private imageResizerService: ImageResizerService,
  ) {}

  uploadImage(file: File, folder: ImageFolder): Observable<string> {
    return from(this.imageResizerService.resize(file)).pipe(
      switchMap((resized) => this.uploadImagePort.uploadImage(resized, folder)),
      map((response) => response.data.url),
    );
  }
}
