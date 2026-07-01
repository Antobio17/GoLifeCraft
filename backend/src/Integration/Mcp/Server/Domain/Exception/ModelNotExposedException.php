<?php

namespace Integration\Mcp\Server\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ModelNotExposedException extends BaseException
{
    public static function alias(string $alias): self
    {
        return new self(
            title: 'Model is not exposed.',
            keyTranslation: 'mcp.model.not.exposed',
            details: ['alias' => $alias]
        );
    }
}
