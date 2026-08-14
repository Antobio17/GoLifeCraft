import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import { timer } from "rxjs";
import { DevicePlatformService } from "@shared/platform/application/services/device-platform.service";
import { FileShareService } from "@shared/file-download/application/services/file-share.service";
import { FileShareOutcome } from "@shared/file-download/domain/models/file-share-outcome.model";

@Injectable({ providedIn: "root" })
export class FileDownloadService {
  private readonly document = inject(DOCUMENT);
  private readonly devicePlatformService = inject(DevicePlatformService);
  private readonly fileShareService = inject(FileShareService);

  private readonly revokeDelayMs = 10000;

  async save(content: Blob, fileName: string, mimeType: string): Promise<void> {
    const file = new File([content], fileName, { type: mimeType });

    if (!this.devicePlatformService.isIos()) return this.download(file);
    if (!this.fileShareService.isSupported()) return this.download(file);

    const outcome = await this.fileShareService.share(file);

    if (FileShareOutcome.FAILED !== outcome) return;

    this.download(file);
  }

  download(file: File): void {
    const url = URL.createObjectURL(file);
    const link = this.document.createElement("a");

    link.href = url;
    link.download = file.name;
    link.rel = "noopener";
    link.type = file.type;
    this.document.body.appendChild(link);
    link.click();
    link.remove();

    timer(this.revokeDelayMs).subscribe(() => URL.revokeObjectURL(url));
  }
}
