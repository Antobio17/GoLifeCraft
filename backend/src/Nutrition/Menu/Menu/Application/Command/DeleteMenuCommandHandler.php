<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Domain\Exception\DeleteMenuException;
use Nutrition\Menu\Menu\Domain\Model\MenuRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteMenuCommandHandler
{
    public function __construct(
        private MenuRepository $menuRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteMenuCommand $command): void
    {
        $menu = $this->menuRepository->findById(id: $command->menuId);
        if (null === $menu) {
            throw DeleteMenuException::menuNotFound(menuId: $command->menuId);
        }

        $menu->delete(
            deletedByUserId: $command->deletedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->menuRepository->delete(menu: $menu);
        $this->domainEventCollectorService->register(aggregate: $menu);
    }
}
