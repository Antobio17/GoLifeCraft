<?php

namespace Shared\Tool\Tool\Infrastructure\Domain\Service\Request;

final readonly class FileUploadedResult
{
    public function __construct(
        public string $name,
        public string $extension,
        public string $mimeType,
        public float $size,
        public string $tempPath,
    ) {
    }
}
