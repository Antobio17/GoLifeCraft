<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Domain\Exception\UpdateMenuException;
use Nutrition\Menu\Menu\Domain\Model\MenuRepository;
use Nutrition\Menu\Menu\Domain\Service\MenuItemTreeBuilder;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ResetMenuItemTreeCommandHandler
{
    public function __construct(
        private MenuRepository $menuRepository,
        private MenuItemTreeBuilder $treeBuilder,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ResetMenuItemTreeCommand $command): void
    {
        $menu = $this->menuRepository->findById(id: $command->menuId);
        if (null === $menu) {
            throw UpdateMenuException::menuNotFound(menuId: $command->menuId);
        }

        $item = $menu->recipeItem(menuItemId: $command->menuItemId);

        $menu->resetItemTree(
            menuItemId: $command->menuItemId,
            nodes: $this->treeBuilder->materialize(
                menuItemId: $item->id,
                recipeId: $item->refId,
                servings: $item->quantity,
                existingNodes: $item->nodes,
                userId: $command->updatedByUserId,
            ),
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->menuRepository->save(menu: $menu);
        $this->domainEventCollectorService->register(aggregate: $menu);
    }
}
