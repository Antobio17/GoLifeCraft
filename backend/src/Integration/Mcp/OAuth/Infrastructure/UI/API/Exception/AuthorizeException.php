<?php

namespace Integration\Mcp\OAuth\Infrastructure\UI\API\Exception;

final class AuthorizeException extends \RuntimeException
{
    private function __construct(
        public readonly string $error,
        public readonly string $description,
    ) {
        parent::__construct(message: $error);
    }

    public static function invalidRequest(): self
    {
        return new self(
            error: 'invalid_request',
            description: 'The authorization request is missing a required parameter or uses an unsupported value.',
        );
    }

    public static function unregisteredRedirectUri(): self
    {
        return new self(
            error: 'invalid_request',
            description: 'The redirect_uri is not allowed by this authorization server.',
        );
    }
}
