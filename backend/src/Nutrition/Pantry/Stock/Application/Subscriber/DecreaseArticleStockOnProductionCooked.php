<?php

namespace Nutrition\Pantry\Stock\Application\Subscriber;

use Nutrition\Kitchen\Production\Domain\Event\ProductionCooked;
use Nutrition\Pantry\Stock\Application\Command\DecreaseArticleStockCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class DecreaseArticleStockOnProductionCooked implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof ProductionCooked) {
            return;
        }

        foreach ($event->consumedArticles as $consumed) {
            $this->messageBus->dispatch(new DecreaseArticleStockCommand(
                articleId: $consumed['articleId'],
                quantity: $consumed['quantity'],
                updatedByUserId: $event->updatedByUserId,
            ));
        }
    }
}
