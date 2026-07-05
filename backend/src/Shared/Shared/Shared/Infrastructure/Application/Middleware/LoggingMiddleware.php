<?php

namespace Shared\Shared\Shared\Infrastructure\Application\Middleware;

use Psr\Log\LoggerInterface;
use Shared\Shared\Shared\Domain\Exception\BaseException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Logger\ExceptionLogger;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\Middleware\MiddlewareInterface;
use Symfony\Component\Messenger\Middleware\StackInterface;

final readonly class LoggingMiddleware implements MiddlewareInterface
{
    public function __construct(
        private LoggerInterface $logger,
    ) {
    }

    public function handle(Envelope $envelope, StackInterface $stack): Envelope
    {
        try {
            return $stack->next()->handle(envelope: $envelope, stack: $stack);
        } catch (\Throwable $e) {
            ExceptionLogger::log(
                logger: $this->logger,
                exception: $e,
                source: $envelope->getMessage()::class,
                level: $this->resolveLevel(exception: $e),
            );

            throw $e;
        }
    }

    private function resolveLevel(\Throwable $exception): string
    {
        $candidates = $exception instanceof HandlerFailedException
            ? $exception->getWrappedExceptions()
            : [$exception];

        foreach ($candidates as $candidate) {
            if (!$candidate instanceof BaseException) {
                return 'error';
            }
        }

        return 'info';
    }
}
