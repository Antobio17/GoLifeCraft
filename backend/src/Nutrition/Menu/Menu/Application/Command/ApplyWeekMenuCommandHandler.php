<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Domain\Exception\LoadMenuIntoDiaryException;
use Nutrition\Menu\Menu\Domain\Model\MenuRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ApplyWeekMenuCommandHandler
{
    public function __construct(
        private MenuRepository $menuRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ApplyWeekMenuCommand $command): void
    {
        $menu = $this->menuRepository->findById(id: $command->menuId);
        if (null === $menu) {
            throw LoadMenuIntoDiaryException::menuNotFound(menuId: $command->menuId);
        }

        $menu->applyWeekIntoDiary(
            weekStartDate: $command->weekStartDate,
            loadedByUserId: $command->loadedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->menuRepository->save(menu: $menu);
        $this->domainEventCollectorService->register(aggregate: $menu);
    }
}
