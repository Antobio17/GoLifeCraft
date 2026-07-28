<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Domain\Exception\DuplicateMenuException;
use Nutrition\Menu\Menu\Domain\Model\Menu;
use Nutrition\Menu\Menu\Domain\Model\MenuRepository;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuItemSnapshot;
use Nutrition\Menu\Menu\Domain\QueryModel\DuplicateMenuNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DuplicateMenuCommandHandler
{
    public function __construct(
        private MenuRepository $menuRepository,
        private DuplicateMenuNeedleDataQuery $needleDataQuery,
        private MenuItemAssembler $menuItemAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DuplicateMenuCommand $command): void
    {
        $snapshot = $this->needleDataQuery->findMenuSnapshot(menuId: $command->menuId);
        if (null === $snapshot) {
            throw DuplicateMenuException::menuNotFound(menuId: $command->menuId);
        }

        $menuId = $this->menuRepository->nextId();

        $menu = Menu::create(
            id: $menuId,
            name: trim(string: $snapshot->name.' '.$command->copySuffix),
            emoji: $snapshot->emoji,
            note: $snapshot->note,
            type: $snapshot->type,
            items: $this->menuItemAssembler->assemble(
                menuId: $menuId,
                items: array_map(
                    callback: static fn (MenuItemSnapshot $item): MenuItemData => new MenuItemData(
                        dayKey: $item->dayKey,
                        meal: $item->meal,
                        kind: $item->kind,
                        refId: $item->refId,
                        quantity: $item->quantity,
                        position: $item->position,
                        unit: $item->unit,
                    ),
                    array: $snapshot->items,
                ),
                userId: $command->createdByUserId,
            ),
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->menuRepository->save(menu: $menu);
        $this->domainEventCollectorService->register(aggregate: $menu);
    }
}
