import { Observable } from "rxjs";
import { ImageFolder } from "@shared/image-upload/domain/models/image-folder.enum";
import { UploadImageResponse } from "@shared/image-upload/domain/models/upload-image-response.model";

export abstract class UploadImagePort {
  abstract uploadImage(
    file: File,
    folder: ImageFolder,
  ): Observable<UploadImageResponse>;
}
