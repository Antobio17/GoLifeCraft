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

    public static function versionRequired(): self
    {
        return new self(
            title: 'Expected version is required on update.',
            keyTranslation: 'mcp.model.version.required',
            details: []
        );
    }

    public static function versionConflict(string $id, ?int $expectedVersion): self
    {
        return new self(
            title: 'Model version conflict.',
            keyTranslation: 'mcp.model.version.conflict',
            details: ['id' => $id, 'expectedVersion' => $expectedVersion]
        );
    }
}
