<?php

namespace Shared\Tool\Tool\Infrastructure\Domain\Service\Linux;

use Shared\Tool\Tool\Domain\Service\ImageStorageService;

final class LinuxImageStorageService implements ImageStorageService
{
    private const array PUBLIC_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    private const string DEFAULT_PUBLIC_EXTENSION = 'jpg';

    public function __construct(
        private readonly string $publicUploadDirectory,
        private readonly string $publicUploadPath,
    ) {
    }

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

        $this->write(imagePath: $imagePath, destinationPath: $destinationPath);

        return $basename;
    }

    public function storePublicImage(
        string $folder,
        string $imagePath,
        string $extension,
    ): string {
        $folder = $this->sanitizeFileName($folder);
        $basename = sprintf('%s.%s', bin2hex(random_bytes(16)), $this->publicExtension(extension: $extension));

        $this->write(
            imagePath: $imagePath,
            destinationPath: sprintf('%s/%s/%s', rtrim($this->publicUploadDirectory, '/'), $folder, $basename),
        );

        return sprintf('%s/%s/%s', rtrim($this->publicUploadPath, '/'), $folder, $basename);
    }

    private function write(string $imagePath, string $destinationPath): void
    {
        $directory = dirname(path: $destinationPath);
        if (!is_dir(filename: $directory)) {
            mkdir(directory: $directory, permissions: 0755, recursive: true);
        }

        if (!copy(from: $imagePath, to: $destinationPath)) {
            throw new \RuntimeException(message: 'Failed to save the image');
        }

        unlink(filename: $imagePath);
    }

    private function publicExtension(string $extension): string
    {
        $extension = strtolower($this->sanitizeFileName($extension));

        if (!in_array($extension, self::PUBLIC_EXTENSIONS, true)) {
            return self::DEFAULT_PUBLIC_EXTENSION;
        }

        return $extension;
    }

    private function sanitizeFileName(string $fileName): string
    {
        return preg_replace(pattern: '/[^a-zA-Z0-9._-]/', replacement: '_', subject: $fileName);
    }
}
