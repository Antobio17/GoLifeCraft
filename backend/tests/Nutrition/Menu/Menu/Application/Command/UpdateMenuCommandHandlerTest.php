<?php

namespace App\Tests\Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Application\Command\MenuItemAssembler;
use Nutrition\Menu\Menu\Application\Command\MenuItemData;
use Nutrition\Menu\Menu\Application\Command\UpdateMenuCommand;
use Nutrition\Menu\Menu\Application\Command\UpdateMenuCommandHandler;
use Nutrition\Menu\Menu\Domain\Exception\UpdateMenuException;
use Nutrition\Menu\Menu\Domain\Model\Menu;
use Nutrition\Menu\Menu\Domain\Model\MenuItem;
use Nutrition\Menu\Menu\Domain\Model\MenuWeekDay;
use Nutrition\Menu\Menu\Infrastructure\Domain\Model\InMemory\InMemoryMenuRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateMenuCommandHandlerTest extends TestCase
{
    private DateTimeGenerator $dateTimeGenerator;
    private InMemoryMenuRepository $menuRepository;
    private DomainEventCollectorService $domainEventCollectorService;
    private UpdateMenuCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->menuRepository = new InMemoryMenuRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new UpdateMenuCommandHandler(
            menuRepository: $this->menuRepository,
            menuItemAssembler: new MenuItemAssembler(dateTimeGenerator: $this->dateTimeGenerator),
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItReplacesNameNoteAndItems(): void
    {
        $this->givenSingleMenu();

        ($this->handler)(new UpdateMenuCommand(
            menuId: 'menu-1',
            name: 'Día ligero',
            emoji: '🥗',
            note: 'Descanso o cardio suave.',
            items: [
                new MenuItemData(
                    dayKey: null,
                    meal: MenuItem::MEAL_LUNCH,
                    kind: MenuItem::KIND_PRODUCT,
                    refId: 'article-2',
                    quantity: 150.0,
                    position: 1,
                    unit: 'g',
                ),
            ],
            updatedByUserId: 'god-user-id',
        ));

        $menu = $this->menuRepository->findById(id: 'menu-1');
        $this->assertEquals(expected: 'Día ligero', actual: $menu->name);
        $this->assertEquals(expected: 'Descanso o cardio suave.', actual: $menu->note);
        $this->assertCount(expectedCount: 1, haystack: $menu->items);
        $this->assertEquals(expected: 'article-2', actual: $menu->items[0]->refId);
        $this->assertNotEmpty(actual: $this->domainEventCollectorService->pullEvents());
    }

    public function testItDropsFromThePlanTheDaysLeftEmpty(): void
    {
        $this->givenWeekMenu();

        ($this->handler)(new UpdateMenuCommand(
            menuId: 'menu-1',
            name: 'Semana fuerza',
            emoji: '🗓️',
            note: '',
            items: [
                new MenuItemData(
                    dayKey: MenuWeekDay::TUESDAY,
                    meal: MenuItem::MEAL_DINNER,
                    kind: MenuItem::KIND_PRODUCT,
                    refId: 'article-1',
                    quantity: 200.0,
                    position: 1,
                    unit: 'g',
                ),
            ],
            updatedByUserId: 'god-user-id',
        ));

        $menu = $this->menuRepository->findById(id: 'menu-1');
        $this->assertEquals(expected: 'tue', actual: $menu->weekDays);
        $this->assertCount(expectedCount: 1, haystack: $menu->itemsForDay(dayKey: MenuWeekDay::TUESDAY));
        $this->assertCount(expectedCount: 0, haystack: $menu->itemsForDay(dayKey: MenuWeekDay::MONDAY));
    }

    public function testItFailsWhenTheMenuDoesNotExist(): void
    {
        $this->expectException(exception: UpdateMenuException::class);

        ($this->handler)(new UpdateMenuCommand(
            menuId: 'missing-menu',
            name: 'Día ligero',
            emoji: '🥗',
            note: '',
            items: [],
            updatedByUserId: 'god-user-id',
        ));
    }

    private function givenSingleMenu(): void
    {
        $this->menuRepository->save(menu: Menu::create(
            id: 'menu-1',
            name: 'Día alto en proteína',
            emoji: '🍗',
            note: '',
            type: Menu::TYPE_SINGLE,
            items: [],
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));
    }

    private function givenWeekMenu(): void
    {
        $this->menuRepository->save(menu: Menu::create(
            id: 'menu-1',
            name: 'Semana fuerza',
            emoji: '🗓️',
            note: '',
            type: Menu::TYPE_WEEK,
            items: (new MenuItemAssembler(dateTimeGenerator: $this->dateTimeGenerator))->assemble(
                menuId: 'menu-1',
                items: [
                    new MenuItemData(
                        dayKey: MenuWeekDay::MONDAY,
                        meal: MenuItem::MEAL_LUNCH,
                        kind: MenuItem::KIND_RECIPE,
                        refId: 'recipe-1',
                        quantity: 1.0,
                        position: 1,
                    ),
                ],
                userId: 'god-user-id',
            ),
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));
    }
}
