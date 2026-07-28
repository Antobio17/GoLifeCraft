<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Domain\Exception\UpdateMenuException;
use Nutrition\Menu\Menu\Domain\Model\MenuRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateMenuCommandHandler
{
    public function __construct(
        private MenuRepository $menuRepository,
        private MenuItemAssembler $menuItemAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateMenuCommand $command): void
    {
        $menu = $this->menuRepository->findById(id: $command->menuId);
        if (null === $menu) {
            throw UpdateMenuException::menuNotFound(menuId: $command->menuId);
        }

        $menu->update(
            name: $command->name,
            emoji: $command->emoji,
            note: $command->note,
            items: $this->menuItemAssembler->assemble(
                menuId: $menu->id,
                items: $command->items,
                userId: $command->updatedByUserId,
            ),
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->menuRepository->save(menu: $menu);
        $this->domainEventCollectorService->register(aggregate: $menu);
    }
}
