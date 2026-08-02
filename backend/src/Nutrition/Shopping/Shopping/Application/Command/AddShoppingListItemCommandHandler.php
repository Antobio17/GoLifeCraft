<?php

namespace Nutrition\Shopping\Shopping\Application\Command;

use Nutrition\Shopping\Shopping\Domain\Exception\AddShoppingListItemException;
use Nutrition\Shopping\Shopping\Domain\Model\ShoppingListItem;
use Nutrition\Shopping\Shopping\Domain\Model\ShoppingListItemRepository;
use Nutrition\Shopping\Shopping\Domain\QueryModel\AddShoppingListItemNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class AddShoppingListItemCommandHandler
{
    public function __construct(
        private ShoppingListItemRepository $shoppingListItemRepository,
        private AddShoppingListItemNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(AddShoppingListItemCommand $command): void
    {
        if (!$this->needleDataQuery->articleExists(articleId: $command->articleId)) {
            throw AddShoppingListItemException::articleNotFound(articleId: $command->articleId);
        }

        $existing = $this->shoppingListItemRepository->findByArticleId(articleId: $command->articleId);

        if (null !== $existing) {
            $existing->increaseNeed(
                quantity: $command->quantity,
                baseQuantity: $command->baseQuantity,
                updatedByUserId: $command->createdByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $this->shoppingListItemRepository->save(shoppingListItem: $existing);
            $this->domainEventCollectorService->register(aggregate: $existing);

            return;
        }

        $item = ShoppingListItem::create(
            id: $this->shoppingListItemRepository->nextId(),
            articleId: $command->articleId,
            quantity: $command->quantity,
            baseQuantity: $command->baseQuantity,
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->shoppingListItemRepository->save(shoppingListItem: $item);
        $this->domainEventCollectorService->register(aggregate: $item);
    }
}
