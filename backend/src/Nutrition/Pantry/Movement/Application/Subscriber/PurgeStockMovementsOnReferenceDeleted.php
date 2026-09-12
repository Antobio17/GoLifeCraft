<?php

namespace Nutrition\Pantry\Movement\Application\Subscriber;

use Nutrition\Catalog\Article\Domain\Event\ArticleDeleted;
use Nutrition\Pantry\Movement\Application\Command\PurgeStockMovementsCommand;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Recipe\Recipe\Domain\Event\RecipeDeleted;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class PurgeStockMovementsOnReferenceDeleted implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if ($event instanceof ArticleDeleted) {
            $this->purge(
                kind: StockMovement::KIND_ARTICLE,
                refId: $event->aggregateId,
                purgedByUserId: $event->deletedByUserId,
            );

            return;
        }

        if (!$event instanceof RecipeDeleted) {
            return;
        }

        $this->purge(
            kind: StockMovement::KIND_RECIPE,
            refId: $event->aggregateId,
            purgedByUserId: $event->deletedByUserId,
        );
    }

    private function purge(string $kind, string $refId, string $purgedByUserId): void
    {
        $this->messageBus->dispatch(new PurgeStockMovementsCommand(
            kind: $kind,
            refId: $refId,
            purgedByUserId: $purgedByUserId,
        ));
    }
}
