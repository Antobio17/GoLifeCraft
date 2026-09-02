<?php

namespace Shared\Tool\Tool\Domain\Service;

final readonly class FetchedImage
{
    public function __construct(
        public string $path,
        public string $extension,
    ) {
    }
}
