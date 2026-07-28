<?php

namespace App\Tests\Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Application\Command\CreateMenuCommand;
use Nutrition\Menu\Menu\Application\Command\CreateMenuCommandHandler;
use Nutrition\Menu\Menu\Application\Command\MenuItemAssembler;
use Nutrition\Menu\Menu\Application\Command\MenuItemData;
use Nutrition\Menu\Menu\Domain\Exception\CreateMenuException;
use Nutrition\Menu\Menu\Domain\Model\Menu;
use Nutrition\Menu\Menu\Domain\Model\MenuItem;
use Nutrition\Menu\Menu\Domain\Model\MenuWeekDay;
use Nutrition\Menu\Menu\Infrastructure\Domain\Model\InMemory\InMemoryMenuRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateMenuCommandHandlerTest extends TestCase
{
    private InMemoryMenuRepository $menuRepository;
    private DomainEventCollectorService $domainEventCollectorService;
    private CreateMenuCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->menuRepository = new InMemoryMenuRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new CreateMenuCommandHandler(
            menuRepository: $this->menuRepository,
            menuItemAssembler: new MenuItemAssembler(dateTimeGenerator: $dateTimeGenerator),
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItCreatesASingleDayMenuWithItems(): void
    {
        ($this->handler)(new CreateMenuCommand(
            name: 'Día alto en proteína',
            emoji: '🍗',
            note: 'Para días de entreno intenso.',
            type: Menu::TYPE_SINGLE,
            items: [
                new MenuItemData(
                    dayKey: null,
                    meal: MenuItem::MEAL_BREAKFAST,
                    kind: MenuItem::KIND_RECIPE,
                    refId: 'recipe-1',
                    quantity: 1.0,
                    position: 1,
                ),
                new MenuItemData(
                    dayKey: null,
                    meal: MenuItem::MEAL_DINNER,
                    kind: MenuItem::KIND_PRODUCT,
                    refId: 'article-1',
                    quantity: 180.0,
                    position: 2,
                    unit: 'g',
                ),
            ],
            createdByUserId: 'god-user-id',
        ));

        $menu = $this->menuRepository->findById(id: 'menu-1');
        $this->assertNotNull(actual: $menu);
        $this->assertEquals(expected: 'Día alto en proteína', actual: $menu->name);
        $this->assertEquals(expected: '', actual: $menu->weekDays);
        $this->assertCount(expectedCount: 2, haystack: $menu->items);
        $this->assertEquals(expected: $menu->id, actual: $menu->items[0]->menuId);
        $this->assertNull(actual: $menu->items[1]->dayKey);
        $this->assertNotEmpty(actual: $this->domainEventCollectorService->pullEvents());
    }

    public function testItPlansTheWeekDaysThatHoldFood(): void
    {
        ($this->handler)(new CreateMenuCommand(
            name: 'Semana fuerza',
            emoji: '🗓️',
            note: '',
            type: Menu::TYPE_WEEK,
            items: [
                new MenuItemData(
                    dayKey: MenuWeekDay::WEDNESDAY,
                    meal: MenuItem::MEAL_DINNER,
                    kind: MenuItem::KIND_PRODUCT,
                    refId: 'article-1',
                    quantity: 150.0,
                    position: 1,
                    unit: 'g',
                ),
                new MenuItemData(
                    dayKey: MenuWeekDay::MONDAY,
                    meal: MenuItem::MEAL_LUNCH,
                    kind: MenuItem::KIND_RECIPE,
                    refId: 'recipe-1',
                    quantity: 1.0,
                    position: 2,
                ),
            ],
            createdByUserId: 'god-user-id',
        ));

        $menu = $this->menuRepository->findById(id: 'menu-1');
        $this->assertNotNull(actual: $menu);
        $this->assertEquals(expected: 'mon,wed', actual: $menu->weekDays);
        $this->assertEquals(expected: [MenuWeekDay::MONDAY, MenuWeekDay::WEDNESDAY], actual: $menu->enabledWeekDays());
    }

    public function testItRejectsWeeklyItemsWithoutAValidWeekDay(): void
    {
        $this->expectException(exception: CreateMenuException::class);

        ($this->handler)(new CreateMenuCommand(
            name: 'Semana fuerza',
            emoji: '🗓️',
            note: '',
            type: Menu::TYPE_WEEK,
            items: [
                new MenuItemData(
                    dayKey: null,
                    meal: MenuItem::MEAL_LUNCH,
                    kind: MenuItem::KIND_RECIPE,
                    refId: 'recipe-1',
                    quantity: 1.0,
                    position: 1,
                ),
            ],
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItRejectsAnInvalidType(): void
    {
        $this->expectException(exception: CreateMenuException::class);

        ($this->handler)(new CreateMenuCommand(
            name: 'Menú raro',
            emoji: '🍽️',
            note: '',
            type: 'month',
            items: [],
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItRejectsItemsWithoutQuantity(): void
    {
        $this->expectException(exception: CreateMenuException::class);

        ($this->handler)(new CreateMenuCommand(
            name: 'Día ligero',
            emoji: '🥗',
            note: '',
            type: Menu::TYPE_SINGLE,
            items: [
                new MenuItemData(
                    dayKey: null,
                    meal: MenuItem::MEAL_SNACK,
                    kind: MenuItem::KIND_PRODUCT,
                    refId: 'article-1',
                    quantity: 0.0,
                    position: 1,
                    unit: 'g',
                ),
            ],
            createdByUserId: 'god-user-id',
        ));
    }
}
