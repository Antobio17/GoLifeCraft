import { Signal, WritableSignal, signal } from "@angular/core";
import { Observable, from, switchMap, tap } from "rxjs";
import { ImageResizerService } from "@shared/design-system/photo-capture/application/services/image-resizer.service";
import { BackgroundRemoverService } from "@shared/image-background/application/services/background-remover.service";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { AggregateImagePort } from "@shared/aggregate-image/domain/ports/aggregate-image.port";

const MAX_CACHED_IMAGES = 200;

export class AggregateImageService {
  private readonly objectUrls = new Map<
    string,
    WritableSignal<string | null>
  >();

  constructor(
    private aggregateImagePort: AggregateImagePort,
    private imageResizerService: ImageResizerService,
    private backgroundRemoverService: BackgroundRemoverService,
  ) {}

  objectUrl(
    kind: AggregateImageKind,
    id: string,
    image: string | null,
  ): Signal<string | null> {
    if (null === image) {
      return signal(null).asReadonly();
    }

    const key = `${kind}:${id}:${image}`;
    const cached = this.objectUrls.get(key);

    if (undefined !== cached) {
      return cached.asReadonly();
    }

    const objectUrl = signal<string | null>(null);
    this.objectUrls.set(key, objectUrl);
    this.evictOldest();

    this.aggregateImagePort.download(kind, id, image).subscribe({
      next: (blob) => this.publish(kind, key, objectUrl, blob),
      error: () => this.objectUrls.delete(key),
    });

    return objectUrl.asReadonly();
  }

  upload(kind: AggregateImageKind, id: string, file: File): Observable<void> {
    return from(this.imageResizerService.resize(file)).pipe(
      switchMap((resized) => this.aggregateImagePort.upload(kind, id, resized)),
      tap(() => this.forget(kind, id)),
    );
  }

  remove(kind: AggregateImageKind, id: string): Observable<void> {
    return this.aggregateImagePort
      .remove(kind, id)
      .pipe(tap(() => this.forget(kind, id)));
  }

  private publish(
    kind: AggregateImageKind,
    key: string,
    objectUrl: WritableSignal<string | null>,
    blob: Blob,
  ): void {
    if (AggregateImageKind.Article !== kind) {
      objectUrl.set(URL.createObjectURL(blob));

      return;
    }

    this.backgroundRemoverService
      .removeWhiteBackground(blob)
      .then((cutOut) => this.publishCutOut(key, objectUrl, cutOut))
      .catch(() => this.publishCutOut(key, objectUrl, blob));
  }

  private publishCutOut(
    key: string,
    objectUrl: WritableSignal<string | null>,
    blob: Blob,
  ): void {
    if (this.objectUrls.get(key) !== objectUrl) {
      return;
    }

    objectUrl.set(URL.createObjectURL(blob));
  }

  private forget(kind: AggregateImageKind, id: string): void {
    const prefix = `${kind}:${id}:`;

    this.objectUrls.forEach((objectUrl, key) => {
      if (!key.startsWith(prefix)) return;

      this.revoke(key, objectUrl);
    });
  }

  private evictOldest(): void {
    while (this.objectUrls.size > MAX_CACHED_IMAGES) {
      const [key, objectUrl] = this.objectUrls.entries().next().value!;
      this.revoke(key, objectUrl);
    }
  }

  private revoke(key: string, objectUrl: WritableSignal<string | null>): void {
    const url = objectUrl();

    if (null !== url) {
      URL.revokeObjectURL(url);
    }

    this.objectUrls.delete(key);
  }
}
