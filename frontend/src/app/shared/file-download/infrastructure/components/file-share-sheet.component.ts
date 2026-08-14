import { Component, computed, inject, signal } from "@angular/core";
import { from } from "rxjs";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconBadgeComponent } from "@shared/design-system/icon-badge/infrastructure/components/icon-badge.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FileDownloadService } from "@shared/file-download/application/services/file-download.service";
import { FileShareService } from "@shared/file-download/application/services/file-share.service";
import { PendingFileShareService } from "@shared/file-download/application/services/pending-file-share.service";
import { FileShareOutcome } from "@shared/file-download/domain/models/file-share-outcome.model";

@Component({
  selector: "app-file-share-sheet",
  templateUrl: "./file-share-sheet.component.html",
  imports: [
    ButtonComponent,
    ContextualTranslatePipe,
    IconBadgeComponent,
    ModalSheetComponent,
    NoteComponent,
    StackComponent,
    TextComponent,
  ],
})
export class FileShareSheetComponent {
  private pendingFileShareService = inject(PendingFileShareService);
  private fileShareService = inject(FileShareService);
  private fileDownloadService = inject(FileDownloadService);

  private readonly sharing = signal(false);

  readonly file = this.pendingFileShareService.file;
  readonly open = computed(() => this.file() !== null);
  readonly fileName = computed(() => this.file()?.name ?? "");
  readonly busy = this.sharing.asReadonly();
  readonly failureReason = this.fileShareService.failureReason;

  onShare(): void {
    const file = this.file();

    if (!file) return;
    if (this.sharing()) return;

    this.sharing.set(true);

    from(this.fileShareService.share(file)).subscribe((outcome) => {
      this.sharing.set(false);
      this.resolve(outcome, file);
    });
  }

  onDownload(): void {
    const file = this.file();

    if (!file) return;

    this.pendingFileShareService.clear();
    this.fileDownloadService.download(file);
  }

  onDismiss(): void {
    if (this.sharing()) return;

    this.pendingFileShareService.clear();
  }

  private resolve(outcome: FileShareOutcome, file: File): void {
    if (FileShareOutcome.FAILED === outcome) return;

    this.pendingFileShareService.clear();

    if (FileShareOutcome.UNSUPPORTED !== outcome) return;

    this.fileDownloadService.download(file);
  }
}
