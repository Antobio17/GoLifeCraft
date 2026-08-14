import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";

@Injectable({ providedIn: "root" })
export class FileDownloadService {
  private readonly document = inject(DOCUMENT);

  save(content: Blob, fileName: string): void {
    const url = URL.createObjectURL(content);
    const link = this.document.createElement("a");

    link.href = url;
    link.download = fileName;
    this.document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }
}
