<?php

namespace Integration\Gemini\Client\Domain\Service;

use Integration\Gemini\Client\Domain\Model\GeminiImage;
use Integration\Gemini\Client\Domain\Model\GeminiResponse;

interface GeminiClient
{
    public function isConfigured(): bool;

    /**
     * @param GeminiImage[]        $images
     * @param array<string, mixed> $schema
     */
    public function generateJson(
        string $prompt,
        array $images,
        array $schema,
        int $maxAttempts = 1,
        ?string $model = null,
    ): GeminiResponse;
}
