<?php

namespace Shared\Tool\Tool\Domain\Service;

interface ImageStorageService
{
    public function storeAggregateImage(
        string $aggregate,
        string $aggregateId,
        string $imagePath,
    ): string;

    public function deleteAggregateImage(
        string $aggregate,
        string $aggregateId,
        ?string $image,
    ): void;

    public function aggregateImagePath(
        string $aggregate,
        string $aggregateId,
        string $image,
    ): ?string;
}
