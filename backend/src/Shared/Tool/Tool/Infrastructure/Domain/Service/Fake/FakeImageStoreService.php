<?php

namespace Shared\Tool\Tool\Infrastructure\Domain\Service\Fake;

use Shared\Tool\Tool\Domain\Service\ImageStorageService;

final class FakeImageStoreService implements ImageStorageService
{
    public array $storedImages = [];
    public array $deletedImages = [];

    public function storeAggregateImage(
        string $aggregate,
        string $aggregateId,
        string $imagePath,
    ): string {
        $this->storedImages[] = [
            'aggregate' => $aggregate,
            'aggregateId' => $aggregateId,
            'imagePath' => $imagePath,
        ];

        return basename(path: $imagePath);
    }

    public function deleteAggregateImage(
        string $aggregate,
        string $aggregateId,
        ?string $image,
    ): void {
        if (null === $image) {
            return;
        }

        $this->deletedImages[] = [
            'aggregate' => $aggregate,
            'aggregateId' => $aggregateId,
            'image' => $image,
        ];
    }

    public function aggregateImagePath(
        string $aggregate,
        string $aggregateId,
        string $image,
    ): ?string {
        return sprintf('/var/uploads/%s/%s/%s', $aggregate, $aggregateId, $image);
    }
}
