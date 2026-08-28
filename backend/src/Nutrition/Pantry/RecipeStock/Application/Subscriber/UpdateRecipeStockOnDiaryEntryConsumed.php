<?php

namespace Nutrition\Pantry\RecipeStock\Application\Subscriber;

use Nutrition\Diary\Diary\Domain\Event\DiaryEntryConsumed;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Pantry\RecipeStock\Application\Command\DecreaseRecipeStockCommand;
use Nutrition\Pantry\RecipeStock\Application\Command\IncreaseRecipeStockCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

/**
 * Cooking fills the fridge and eating empties it. Without this the balance would only ever grow and
 * the diary would keep claiming there is food left long after it was eaten.
 */
final readonly class UpdateRecipeStockOnDiaryEntryConsumed implements DomainEventSubscriber
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

        if (DiaryEntry::KIND_RECIPE !== $event->kind || null === $event->refId) {
            return;
        }

        $this->messageBus->dispatch($event->consumed
            ? new DecreaseRecipeStockCommand(
                recipeId: $event->refId,
                servings: $event->quantity,
                updatedByUserId: $event->updatedByUserId,
            )
            : new IncreaseRecipeStockCommand(
                recipeId: $event->refId,
                servings: $event->quantity,
                updatedByUserId: $event->updatedByUserId,
            ));
    }
}
