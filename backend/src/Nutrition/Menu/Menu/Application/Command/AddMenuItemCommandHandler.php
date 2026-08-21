<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Domain\Exception\UpdateMenuException;
use Nutrition\Menu\Menu\Domain\Model\MenuItem;
use Nutrition\Menu\Menu\Domain\Model\MenuRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class AddMenuItemCommandHandler
{
    public function __construct(
        private MenuRepository $menuRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(AddMenuItemCommand $command): void
    {
        $menu = $this->menuRepository->findById(id: $command->menuId);
        if (null === $menu) {
            throw UpdateMenuException::menuNotFound(menuId: $command->menuId);
        }

        if (null !== $menu->findItem(menuItemId: $command->menuItemId)) {
            return;
        }

        $menu->addItem(
            item: MenuItem::createWithId(
                id: $command->menuItemId,
                menuId: $menu->id,
                dayKey: $command->dayKey,
                meal: $command->meal,
                kind: $command->kind,
                refId: $command->refId,
                quantity: $command->quantity,
                unit: $command->unit,
                position: $menu->nextItemPosition(),
                createdByUserId: $command->addedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            ),
            addedByUserId: $command->addedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->menuRepository->save(menu: $menu);
        $this->domainEventCollectorService->register(aggregate: $menu);
    }
}
