<?php

namespace Integration\Mcp\Server\Infrastructure\UI\Mcp;

use Shared\Shared\Shared\Domain\Exception\BaseException;
use Symfony\Component\Messenger\Exception\HandlerFailedException;

final class McpToolResult
{
    public static function success(): array
    {
        return ['success' => true];
    }

    public static function error(BaseException $exception): array
    {
        return ['error' => [
            'title' => $exception->title,
            'keyTranslation' => $exception->keyTranslation,
            'details' => $exception->details,
        ]];
    }

    public static function fromHandlerFailure(HandlerFailedException $exception): array
    {
        foreach ($exception->getNestedExceptions() as $nested) {
            if ($nested instanceof BaseException) {
                return self::error(exception: $nested);
            }
        }

        return ['error' => [
            'title' => $exception->getMessage(),
            'keyTranslation' => 'mcp.handler.failed',
            'details' => [],
        ]];
    }
}
