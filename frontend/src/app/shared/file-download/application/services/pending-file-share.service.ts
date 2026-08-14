import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class PendingFileShareService {
  private readonly pending = signal<File | null>(null);

  readonly file = this.pending.asReadonly();

  request(file: File): void {
    this.pending.set(file);
  }

  clear(): void {
    this.pending.set(null);
  }
}
