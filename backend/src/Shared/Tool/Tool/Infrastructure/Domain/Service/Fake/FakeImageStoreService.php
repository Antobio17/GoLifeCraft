<?php

namespace Shared\Tool\Tool\Infrastructure\Domain\Service\Fake;

use Shared\Tool\Tool\Domain\Service\ImageStorageService;

final class FakeImageStoreService implements ImageStorageService
{
    public array $storedImages = [];

    public function storeAggregateImage(
        string $aggregate,
        string $aggregateId,
        string $imagePath,
    ): string {
        $destinationPath = sprintf(
            '/var/www/html/var/uploads/%s/%s/%s',
            $aggregate,
            $aggregateId,
            basename(path: $imagePath)
        );

        $this->storedImages[] = [
            'aggregate' => $aggregate,
            'aggregateId' => $aggregateId,
            'imagePath' => $imagePath,
        ];

        return $destinationPath;
    }
}
