<?php

namespace Shared\Shared\Shared\Infrastructure\Application\Middleware;

use Shared\Shared\Shared\Application\Manager\TransactionManager;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\Middleware\MiddlewareInterface;
use Symfony\Component\Messenger\Middleware\StackInterface;

final readonly class TransactionMiddleware implements MiddlewareInterface
{
    public function __construct(
        private TransactionManager $transactionManager,
    ) {
    }

    public function handle(Envelope $envelope, StackInterface $stack): Envelope
    {
        $this->transactionManager->beginTransaction();

        try {
            $envelope = $stack->next()->handle(envelope: $envelope, stack: $stack);

            $this->transactionManager->flush();

            return $envelope;
        } catch (\Throwable $e) {
            $this->transactionManager->rollback();

            throw $e;
        }
    }
}
