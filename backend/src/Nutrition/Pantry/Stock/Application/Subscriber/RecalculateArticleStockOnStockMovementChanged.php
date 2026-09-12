<?php

namespace Nutrition\Pantry\Stock\Application\Subscriber;

use Nutrition\Pantry\Movement\Domain\Event\StockMovementRegistered;
use Nutrition\Pantry\Movement\Domain\Event\StockMovementRevoked;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Stock\Application\Command\RecalculateArticleStockCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class RecalculateArticleStockOnStockMovementChanged implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof StockMovementRegistered && !$event instanceof StockMovementRevoked) {
            return;
        }

        if (StockMovement::KIND_ARTICLE !== $event->kind) {
            return;
        }

        $this->messageBus->dispatch(new RecalculateArticleStockCommand(
            articleId: $event->refId,
            updatedByUserId: $event instanceof StockMovementRevoked
                ? $event->revokedByUserId
                : $event->updatedByUserId,
        ));
    }
}
