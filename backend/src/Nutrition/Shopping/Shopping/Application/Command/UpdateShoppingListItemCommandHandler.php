<?php

namespace Nutrition\Shopping\Shopping\Application\Command;

use Nutrition\Shopping\Shopping\Domain\Exception\UpdateShoppingListItemException;
use Nutrition\Shopping\Shopping\Domain\Model\ShoppingListItemRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateShoppingListItemCommandHandler
{
    public function __construct(
        private ShoppingListItemRepository $shoppingListItemRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateShoppingListItemCommand $command): void
    {
        $item = $this->shoppingListItemRepository->findById(id: $command->shoppingListItemId);
        if (null === $item) {
            throw UpdateShoppingListItemException::shoppingListItemNotFound(
                shoppingListItemId: $command->shoppingListItemId,
            );
        }

        $item->update(
            quantity: $command->quantity,
            checked: $command->checked,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->shoppingListItemRepository->save(shoppingListItem: $item);
        $this->domainEventCollectorService->register(aggregate: $item);
    }
}
