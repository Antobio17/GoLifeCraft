<?php

namespace Nutrition\Pantry\Stock\Application\Subscriber;

use Nutrition\Diary\Diary\Domain\Event\DiaryEntryConsumed;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Pantry\Stock\Application\Command\DecreaseArticleStockCommand;
use Nutrition\Pantry\Stock\Application\Command\IncreaseArticleStockCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class UpdateArticleStockOnDiaryEntryConsumed implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof DiaryEntryConsumed) {
            return;
        }

        if (DiaryEntry::KIND_PRODUCT !== $event->kind || null === $event->refId) {
            return;
        }

        $this->messageBus->dispatch($event->consumed
            ? new DecreaseArticleStockCommand(
                articleId: $event->refId,
                quantity: $event->quantity,
                updatedByUserId: $event->updatedByUserId,
                unit: $event->unit,
            )
            : new IncreaseArticleStockCommand(
                articleId: $event->refId,
                quantity: $event->quantity,
                updatedByUserId: $event->updatedByUserId,
                unit: $event->unit,
            ));
    }
}
