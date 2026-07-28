<?php

namespace App\Tests\Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Application\Command\DuplicateMenuCommand;
use Nutrition\Menu\Menu\Application\Command\DuplicateMenuCommandHandler;
use Nutrition\Menu\Menu\Application\Command\MenuItemAssembler;
use Nutrition\Menu\Menu\Domain\Exception\DuplicateMenuException;
use Nutrition\Menu\Menu\Domain\Model\Menu;
use Nutrition\Menu\Menu\Domain\Model\MenuItem;
use Nutrition\Menu\Menu\Domain\Model\MenuWeekDay;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuItemSnapshot;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuSnapshot;
use Nutrition\Menu\Menu\Infrastructure\Domain\Model\InMemory\InMemoryMenuRepository;
use Nutrition\Menu\Menu\Infrastructure\Domain\QueryModel\InMemory\InMemoryDuplicateMenuNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DuplicateMenuCommandHandlerTest extends TestCase
{
    private InMemoryMenuRepository $menuRepository;
    private InMemoryDuplicateMenuNeedleDataQuery $needleDataQuery;
    private DuplicateMenuCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->menuRepository = new InMemoryMenuRepository();
        $this->needleDataQuery = new InMemoryDuplicateMenuNeedleDataQuery();
        $this->handler = new DuplicateMenuCommandHandler(
            menuRepository: $this->menuRepository,
            needleDataQuery: $this->needleDataQuery,
            menuItemAssembler: new MenuItemAssembler(dateTimeGenerator: $dateTimeGenerator),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItCopiesTheMenuWithItsItems(): void
    {
        $this->needleDataQuery->add(snapshot: new MenuSnapshot(
            id: 'menu-source',
            name: 'Semana fuerza',
            emoji: '🗓️',
            note: 'Alto en proteína.',
            type: Menu::TYPE_WEEK,
            items: [
                new MenuItemSnapshot(
                    dayKey: MenuWeekDay::MONDAY,
                    meal: MenuItem::MEAL_LUNCH,
                    kind: MenuItem::KIND_RECIPE,
                    refId: 'recipe-1',
                    quantity: 1.0,
                    unit: null,
                    position: 1,
                ),
            ],
        ));

        ($this->handler)(new DuplicateMenuCommand(
            menuId: 'menu-source',
            copySuffix: '(copia)',
            createdByUserId: 'god-user-id',
        ));

        $copy = $this->menuRepository->findById(id: 'menu-1');
        $this->assertNotNull(actual: $copy);
        $this->assertEquals(expected: 'Semana fuerza (copia)', actual: $copy->name);
        $this->assertEquals(expected: 'mon', actual: $copy->weekDays);
        $this->assertCount(expectedCount: 1, haystack: $copy->items);
        $this->assertEquals(expected: 'menu-1', actual: $copy->items[0]->menuId);
    }

    public function testItFailsWhenTheSourceMenuDoesNotExist(): void
    {
        $this->expectException(exception: DuplicateMenuException::class);

        ($this->handler)(new DuplicateMenuCommand(
            menuId: 'missing-menu',
            copySuffix: '(copia)',
            createdByUserId: 'god-user-id',
        ));
    }
}
