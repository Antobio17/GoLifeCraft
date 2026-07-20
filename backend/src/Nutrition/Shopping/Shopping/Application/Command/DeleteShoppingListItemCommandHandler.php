<?php

namespace Nutrition\Shopping\Shopping\Application\Command;

use Nutrition\Shopping\Shopping\Domain\Exception\DeleteShoppingListItemException;
use Nutrition\Shopping\Shopping\Domain\Model\ShoppingListItemRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteShoppingListItemCommandHandler
{
    public function __construct(
        private ShoppingListItemRepository $shoppingListItemRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteShoppingListItemCommand $command): void
    {
        $item = $this->shoppingListItemRepository->findById(id: $command->shoppingListItemId);
        if (null === $item) {
            throw DeleteShoppingListItemException::shoppingListItemNotFound(
                shoppingListItemId: $command->shoppingListItemId,
            );
        }

        $item->delete(
            deletedByUserId: $command->deletedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->shoppingListItemRepository->delete(shoppingListItem: $item);
        $this->domainEventCollectorService->register(aggregate: $item);
    }
}
