<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Domain\Exception\UpdateMenuException;
use Nutrition\Menu\Menu\Domain\Model\MenuRepository;
use Nutrition\Menu\Menu\Domain\Service\MenuItemTreeBuilder;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateMenuItemNodeCommandHandler
{
    public function __construct(
        private MenuRepository $menuRepository,
        private MenuItemTreeBuilder $treeBuilder,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateMenuItemNodeCommand $command): void
    {
        $menu = $this->menuRepository->findById(id: $command->menuId);
        if (null === $menu) {
            throw UpdateMenuException::menuNotFound(menuId: $command->menuId);
        }

        $item = $menu->recipeItem(menuItemId: $command->menuItemId);

        if (!$item->hasTree()) {
            $item->replaceTree(
                nodes: $this->treeBuilder->materialize(
                    menuItemId: $item->id,
                    recipeId: $item->refId,
                    servings: $item->quantity,
                    existingNodes: [],
                    userId: $command->updatedByUserId,
                ),
                customized: false,
            );
        }

        $menu->adjustItemNode(
            menuItemId: $command->menuItemId,
            nodePath: $command->nodePath,
            quantity: $command->quantity,
            unit: $command->unit,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->treeBuilder->refresh(nodes: $item->nodes);

        $menu->applyItemTree(
            menuItemId: $command->menuItemId,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->menuRepository->save(menu: $menu);
        $this->domainEventCollectorService->register(aggregate: $menu);
    }
}
