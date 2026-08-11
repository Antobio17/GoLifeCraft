<?php

namespace Nutrition\Pantry\Stock\Application\Subscriber;

use Nutrition\Catalog\Article\Domain\Event\ArticleDeleted;
use Nutrition\Pantry\Stock\Application\Command\DeleteArticleStockCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class DeleteArticleStockOnArticleDeleted implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof ArticleDeleted) {
            return;
        }

        $this->messageBus->dispatch(new DeleteArticleStockCommand(
            articleId: $event->aggregateId,
            deletedByUserId: $event->deletedByUserId,
        ));
    }
}
