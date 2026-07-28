<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Domain\Model\Menu;
use Nutrition\Menu\Menu\Domain\Model\MenuRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateMenuCommandHandler
{
    public function __construct(
        private MenuRepository $menuRepository,
        private MenuItemAssembler $menuItemAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateMenuCommand $command): void
    {
        $menuId = $this->menuRepository->nextId();

        $menu = Menu::create(
            id: $menuId,
            name: $command->name,
            emoji: $command->emoji,
            note: $command->note,
            type: $command->type,
            items: $this->menuItemAssembler->assemble(
                menuId: $menuId,
                items: $command->items,
                userId: $command->createdByUserId,
            ),
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->menuRepository->save(menu: $menu);
        $this->domainEventCollectorService->register(aggregate: $menu);
    }
}
