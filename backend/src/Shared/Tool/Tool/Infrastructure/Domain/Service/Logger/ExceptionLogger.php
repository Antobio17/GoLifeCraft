<?php

namespace Shared\Tool\Tool\Infrastructure\Domain\Service\Logger;

use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Exception\HandlerFailedException;

final class ExceptionLogger
{
    public static function log(
        LoggerInterface $logger,
        \Throwable $exception,
        string $source,
        string $level = 'warning',
    ): void {
        $context = [
            'source' => $source,
            'exception' => $exception::class,
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
        ];

        if ($exception instanceof HandlerFailedException) {
            $context['nested'] = array_map(
                callback: fn (\Throwable $nested) => $nested::class.': '.$nested->getMessage(),
                array: iterator_to_array(iterator: $exception->getWrappedExceptions()),
            );
        }

        $logger->log(level: $level, message: 'Exception caught while handling message', context: $context);
    }
}
