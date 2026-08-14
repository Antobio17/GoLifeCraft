import { DOCUMENT } from "@angular/common";
import { Injectable, inject, signal } from "@angular/core";
import { FileShareOutcome } from "@shared/file-download/domain/models/file-share-outcome.model";

@Injectable({ providedIn: "root" })
export class FileShareService {
  private readonly window = inject(DOCUMENT).defaultView;

  private readonly lastError = signal<string>("");

  readonly failureReason = this.lastError.asReadonly();

  isSupported(): boolean {
    return typeof this.window?.navigator?.share === "function";
  }

  async share(file: File): Promise<FileShareOutcome> {
    if (!this.isSupported()) return FileShareOutcome.UNSUPPORTED;

    this.lastError.set("");

    try {
      await this.window!.navigator.share({ files: [file] });

      return FileShareOutcome.SHARED;
    } catch (error) {
      return this.resolveFailure(error);
    }
  }

  private resolveFailure(error: unknown): FileShareOutcome {
    const name = error instanceof DOMException ? error.name : "Error";

    if ("AbortError" === name) return FileShareOutcome.DISMISSED;

    this.lastError.set(name);

    return FileShareOutcome.FAILED;
  }
}
