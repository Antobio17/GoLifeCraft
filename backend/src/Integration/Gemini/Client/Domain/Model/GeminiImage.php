<?php

namespace Integration\Gemini\Client\Domain\Model;

final readonly class GeminiImage
{
    public function __construct(
        public string $mimeType,
        public string $bytes,
    ) {
    }

    public function sizeInKilobytes(): int
    {
        return intdiv(strlen($this->bytes), 1024);
    }
}
