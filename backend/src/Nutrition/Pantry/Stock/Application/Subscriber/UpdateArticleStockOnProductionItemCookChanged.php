<?php

namespace Nutrition\Pantry\Stock\Application\Subscriber;

use Nutrition\Kitchen\Production\Domain\Event\ProductionItemCooked;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemUncooked;
use Nutrition\Pantry\Stock\Application\Command\DecreaseArticleStockCommand;
use Nutrition\Pantry\Stock\Application\Command\IncreaseArticleStockCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class UpdateArticleStockOnProductionItemCookChanged implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof ProductionItemCooked && !$event instanceof ProductionItemUncooked) {
            return;
        }

        $cooked = $event instanceof ProductionItemCooked;

        foreach ($event->consumedArticles as $consumed) {
            $this->messageBus->dispatch($cooked
                ? new DecreaseArticleStockCommand(
                    articleId: $consumed['articleId'],
                    quantity: $consumed['quantity'],
                    updatedByUserId: $event->updatedByUserId,
                )
                : new IncreaseArticleStockCommand(
                    articleId: $consumed['articleId'],
                    quantity: $consumed['quantity'],
                    updatedByUserId: $event->updatedByUserId,
                ));
        }
    }
}
