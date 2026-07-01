<?php

namespace Integration\Mcp\Server\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ModelValidationException extends BaseException
{
    public static function failed(array $errors): self
    {
        return new self(
            title: 'Model validation failed',
            keyTranslation: 'mcp.model.validation.failed',
            details: $errors
        );
    }
}
