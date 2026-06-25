<?php

namespace Shared\Tool\Tool\Infrastructure\Domain\Service\Linux;

use Shared\Tool\Tool\Domain\Service\ImageStorageService;

final class LinuxImageStorageService implements ImageStorageService
{
    public function storeAggregateImage(
        string $aggregate,
        string $aggregateId,
        string $imagePath,
    ): string {
        $name = pathinfo(path: $imagePath, flags: PATHINFO_FILENAME);
        $extension = pathinfo(path: $imagePath, flags: PATHINFO_EXTENSION);
        $basename = sprintf('%s_%s.%s', $name, uniqid(), $extension);
        $basename = $this->sanitizeFileName($basename);

        $destinationPath = sprintf(
            '/var/www/html/var/uploads/%s/%s/%s',
            $aggregate,
            $aggregateId,
            $basename
        );

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

    private function sanitizeFileName(string $fileName): string
    {
        return preg_replace(pattern: '/[^a-zA-Z0-9._-]/', replacement: '_', subject: $fileName);
    }
}
