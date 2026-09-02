<?php

namespace Shared\Tool\Tool\Domain\Service;

interface ImageStorageService
{
    public function storeAggregateImage(
        string $aggregate,
        string $aggregateId,
        string $imagePath,
    ): string;

    public function storePublicImage(
        string $folder,
        string $imagePath,
        string $extension,
    ): string;
}
