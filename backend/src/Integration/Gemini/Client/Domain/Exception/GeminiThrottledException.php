<?php

namespace Integration\Gemini\Client\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GeminiThrottledException extends BaseException
{
    public static function forStatus(int $statusCode): self
    {
        return new self(
            title: sprintf('Gemini throttled the request with status %d.', $statusCode),
            keyTranslation: 'gemini.throttled',
            details: ['statusCode' => $statusCode]
        );
    }
}
