<?php

namespace Integration\Mcp\OAuth\Infrastructure\UI\API\Exception;

final class AuthorizeException extends \RuntimeException
{
    private function __construct(
        public readonly string $error,
    ) {
        parent::__construct(message: $error);
    }

    public static function invalidRequest(): self
    {
        return new self(error: 'invalid_request');
    }
}
