<?php

namespace Integration\Mcp\OAuth\Infrastructure\UI\API\Exception;

final class TokenException extends \RuntimeException
{
    private function __construct(
        public readonly string $error,
    ) {
        parent::__construct(message: $error);
    }

    public static function unsupportedGrantType(): self
    {
        return new self(error: 'unsupported_grant_type');
    }

    public static function invalidRequest(): self
    {
        return new self(error: 'invalid_request');
    }

    public static function invalidGrant(): self
    {
        return new self(error: 'invalid_grant');
    }
}
