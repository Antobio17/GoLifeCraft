import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ImageFolder } from "@shared/image-upload/domain/models/image-folder.enum";
import { UploadImageResponse } from "@shared/image-upload/domain/models/upload-image-response.model";
import { UploadImagePort } from "@shared/image-upload/domain/ports/upload-image.port";

@Injectable()
export class HttpUploadImageAdapter extends UploadImagePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/shared/image";

  uploadImage(
    file: File,
    folder: ImageFolder,
  ): Observable<UploadImageResponse> {
    const formData = new FormData();
    formData.append("image", file, file.name);
    formData.append("folder", folder);

    return this.http.post<UploadImageResponse>(this.apiUrl, formData);
  }
}
