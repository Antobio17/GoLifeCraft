<?php

namespace Mcp\Server\Mcp\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class WriteModelException extends BaseException
{
    public static function notFound(string $alias, string $id): self
    {
        return new self(
            title: 'Model record not found.',
            keyTranslation: 'mcp.model.not.found',
            details: ['alias' => $alias, 'id' => $id]
        );
    }
}
