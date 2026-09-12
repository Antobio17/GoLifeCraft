<?php

namespace Nutrition\Pantry\RecipeStock\Application\Subscriber;

use Nutrition\Pantry\Movement\Domain\Event\StockMovementRegistered;
use Nutrition\Pantry\Movement\Domain\Event\StockMovementRevoked;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\RecipeStock\Application\Command\RecalculateRecipeStockCommand;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class RecalculateRecipeStockOnStockMovementChanged implements DomainEventSubscriber
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

        if (StockMovement::KIND_RECIPE !== $event->kind) {
            return;
        }

        $this->messageBus->dispatch(new RecalculateRecipeStockCommand(
            recipeId: $event->refId,
            updatedByUserId: $event instanceof StockMovementRevoked
                ? $event->revokedByUserId
                : $event->updatedByUserId,
        ));
    }
}
