<?php

namespace Shared\Tool\Tool\Infrastructure\Domain\Service\Linux;

use Shared\Tool\Tool\Domain\Service\ImageStorageService;

final class LinuxImageStorageService implements ImageStorageService
{
    public function __construct(
        private readonly string $uploadDirectory,
    ) {
    }

    public function storeAggregateImage(
        string $aggregate,
        string $aggregateId,
        string $imagePath,
    ): string {
        $name = pathinfo(path: $imagePath, flags: PATHINFO_FILENAME);
        $extension = pathinfo(path: $imagePath, flags: PATHINFO_EXTENSION);
        $basename = $this->sanitizeFileName(sprintf('%s_%s.%s', $name, uniqid(), $extension));

        $destinationPath = $this->path(aggregate: $aggregate, aggregateId: $aggregateId, image: $basename);

        $directory = dirname(path: $destinationPath);
        if (!is_dir(filename: $directory)) {
            mkdir(directory: $directory, permissions: 0755, recursive: true);
        }

        if (!copy(from: $imagePath, to: $destinationPath)) {
            throw new \RuntimeException(message: 'Failed to save the image');
        }

        unlink(filename: $imagePath);

        return $basename;
    }

    public function deleteAggregateImage(
        string $aggregate,
        string $aggregateId,
        ?string $image,
    ): void {
        if (null === $image) {
            return;
        }

        $path = $this->aggregateImagePath(aggregate: $aggregate, aggregateId: $aggregateId, image: $image);

        if (null === $path) {
            return;
        }

        unlink(filename: $path);
    }

    public function aggregateImagePath(
        string $aggregate,
        string $aggregateId,
        string $image,
    ): ?string {
        $path = $this->path(aggregate: $aggregate, aggregateId: $aggregateId, image: $image);

        return is_file(filename: $path) ? $path : null;
    }

    private function path(string $aggregate, string $aggregateId, string $image): string
    {
        return sprintf(
            '%s/%s/%s/%s',
            rtrim($this->uploadDirectory, '/'),
            $this->sanitizeFileName($aggregate),
            $this->sanitizeFileName($aggregateId),
            $this->sanitizeFileName($image),
        );
    }

    private function sanitizeFileName(string $fileName): string
    {
        return preg_replace(pattern: '/[^a-zA-Z0-9._-]/', replacement: '_', subject: $fileName);
    }
}
