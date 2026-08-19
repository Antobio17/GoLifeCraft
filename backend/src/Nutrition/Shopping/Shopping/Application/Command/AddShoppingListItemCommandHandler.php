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
        if (null !== $command->customName) {
            $this->addCustomItem(command: $command);

            return;
        }

        if (null === $command->articleId) {
            throw AddShoppingListItemException::articleOrCustomNameIsRequired();
        }

        $this->addCatalogItem(command: $command, articleId: $command->articleId);
    }

    private function addCatalogItem(AddShoppingListItemCommand $command, string $articleId): void
    {
        if (!$this->needleDataQuery->articleExists(articleId: $articleId)) {
            throw AddShoppingListItemException::articleNotFound(articleId: $articleId);
        }

        $existing = $this->shoppingListItemRepository->findByArticleId(articleId: $articleId);

        if (null !== $existing) {
            $this->increaseNeed(item: $existing, command: $command, baseQuantity: $command->baseQuantity);

            return;
        }

        $this->persist(item: ShoppingListItem::create(
            id: $this->shoppingListItemRepository->nextId(),
            articleId: $articleId,
            quantity: $command->quantity,
            baseQuantity: $command->baseQuantity,
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        ));
    }

    private function addCustomItem(AddShoppingListItemCommand $command): void
    {
        $customName = ShoppingListItem::normalizeCustomName(customName: $command->customName);

        if ('' === $customName) {
            throw AddShoppingListItemException::customNameIsEmpty();
        }

        $existing = $this->shoppingListItemRepository->findByCustomName(customName: $customName);

        if (null !== $existing) {
            $this->increaseNeed(item: $existing, command: $command, baseQuantity: null);

            return;
        }

        $this->persist(item: ShoppingListItem::createCustom(
            id: $this->shoppingListItemRepository->nextId(),
            customName: $customName,
            quantity: $command->quantity,
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        ));
    }

    private function increaseNeed(
        ShoppingListItem $item,
        AddShoppingListItemCommand $command,
        ?float $baseQuantity,
    ): void {
        $item->increaseNeed(
            quantity: $command->quantity,
            baseQuantity: $baseQuantity,
            updatedByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->persist(item: $item);
    }

    private function persist(ShoppingListItem $item): void
    {
        $this->shoppingListItemRepository->save(shoppingListItem: $item);
        $this->domainEventCollectorService->register(aggregate: $item);
    }
}
