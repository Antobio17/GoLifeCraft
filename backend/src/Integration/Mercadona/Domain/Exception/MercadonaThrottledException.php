<?php

namespace Integration\Mercadona\Domain\Exception;

final class MercadonaThrottledException extends \RuntimeException
{
    public static function forStatus(string $service, int $statusCode): self
    {
        return new self(sprintf('%s throttled the request with status %d.', $service, $statusCode));
    }
}
