<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Domain\Exception\UpdateMenuException;
use Nutrition\Menu\Menu\Domain\Model\MenuRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RemoveMenuItemCommandHandler
{
    public function __construct(
        private MenuRepository $menuRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(RemoveMenuItemCommand $command): void
    {
        $menu = $this->menuRepository->findById(id: $command->menuId);
        if (null === $menu) {
            throw UpdateMenuException::menuNotFound(menuId: $command->menuId);
        }

        if (null === $menu->findItem(menuItemId: $command->menuItemId)) {
            return;
        }

        $menu->removeItem(
            menuItemId: $command->menuItemId,
            removedByUserId: $command->removedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->menuRepository->save(menu: $menu);
        $this->domainEventCollectorService->register(aggregate: $menu);
    }
}
