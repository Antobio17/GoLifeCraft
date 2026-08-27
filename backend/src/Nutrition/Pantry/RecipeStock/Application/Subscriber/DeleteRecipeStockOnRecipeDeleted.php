<?php

namespace Nutrition\Pantry\RecipeStock\Application\Subscriber;

use Nutrition\Pantry\RecipeStock\Application\Command\DeleteRecipeStockCommand;
use Nutrition\Recipe\Recipe\Domain\Event\RecipeDeleted;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class DeleteRecipeStockOnRecipeDeleted implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof RecipeDeleted) {
            return;
        }

        $this->messageBus->dispatch(new DeleteRecipeStockCommand(
            recipeId: $event->aggregateId,
            deletedByUserId: $event->deletedByUserId,
        ));
    }
}
