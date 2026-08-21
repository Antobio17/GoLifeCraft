<?php

namespace App\Tests\Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Application\Command\AddMenuItemCommand;
use Nutrition\Menu\Menu\Application\Command\AddMenuItemCommandHandler;
use Nutrition\Menu\Menu\Application\Command\RemoveMenuItemCommand;
use Nutrition\Menu\Menu\Application\Command\RemoveMenuItemCommandHandler;
use Nutrition\Menu\Menu\Application\Command\UpdateMenuDetailsCommand;
use Nutrition\Menu\Menu\Application\Command\UpdateMenuDetailsCommandHandler;
use Nutrition\Menu\Menu\Application\Command\UpdateMenuItemCommand;
use Nutrition\Menu\Menu\Application\Command\UpdateMenuItemCommandHandler;
use Nutrition\Menu\Menu\Domain\Exception\UpdateMenuException;
use Nutrition\Menu\Menu\Domain\Model\Menu;
use Nutrition\Menu\Menu\Domain\Model\MenuItem;
use Nutrition\Menu\Menu\Domain\Model\MenuWeekDay;
use Nutrition\Menu\Menu\Infrastructure\Domain\Model\InMemory\InMemoryMenuRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class MenuItemCommandHandlersTest extends TestCase
{
    private const ITEM_ID = '11111111-1111-4111-8111-111111111111';
    private const OTHER_ITEM_ID = '22222222-2222-4222-8222-222222222222';

    private DateTimeGenerator $dateTimeGenerator;
    private InMemoryMenuRepository $menuRepository;
    private UpdateMenuDetailsCommandHandler $updateDetailsHandler;
    private AddMenuItemCommandHandler $addItemHandler;
    private UpdateMenuItemCommandHandler $updateItemHandler;
    private RemoveMenuItemCommandHandler $removeItemHandler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->menuRepository = new InMemoryMenuRepository();
        $domainEventCollectorService = new DomainEventCollectorService();

        $this->updateDetailsHandler = new UpdateMenuDetailsCommandHandler(
            menuRepository: $this->menuRepository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->addItemHandler = new AddMenuItemCommandHandler(
            menuRepository: $this->menuRepository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->updateItemHandler = new UpdateMenuItemCommandHandler(
            menuRepository: $this->menuRepository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->removeItemHandler = new RemoveMenuItemCommandHandler(
            menuRepository: $this->menuRepository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testUpdatingDetailsLeavesItemsUntouched(): void
    {
        $this->givenSingleMenu();
        ($this->addItemHandler)($this->addCommand());

        ($this->updateDetailsHandler)(new UpdateMenuDetailsCommand(
            menuId: 'menu-1',
            name: 'Día ligero',
            emoji: '🥗',
            note: 'Cardio suave.',
            updatedByUserId: 'god-user-id',
        ));

        $menu = $this->menuRepository->findById(id: 'menu-1');
        $this->assertEquals(expected: 'Día ligero', actual: $menu->name);
        $this->assertEquals(expected: '🥗', actual: $menu->emoji);
        $this->assertCount(expectedCount: 1, haystack: $menu->items);
        $this->assertEquals(expected: self::ITEM_ID, actual: $menu->items[0]->id);
    }

    public function testItAddsAnItemWithTheGivenId(): void
    {
        $this->givenSingleMenu();

        ($this->addItemHandler)($this->addCommand());

        $menu = $this->menuRepository->findById(id: 'menu-1');
        $this->assertCount(expectedCount: 1, haystack: $menu->items);
        $this->assertEquals(expected: self::ITEM_ID, actual: $menu->items[0]->id);
        $this->assertEquals(expected: 1, actual: $menu->items[0]->position);
    }

    public function testAddingTheSameItemTwiceIsIdempotent(): void
    {
        $this->givenSingleMenu();

        ($this->addItemHandler)($this->addCommand());
        ($this->addItemHandler)($this->addCommand());

        $menu = $this->menuRepository->findById(id: 'menu-1');
        $this->assertCount(expectedCount: 1, haystack: $menu->items);
    }

    public function testItRejectsADayKeyOnASingleMenu(): void
    {
        $this->givenSingleMenu();

        $this->expectException(exception: UpdateMenuException::class);

        ($this->addItemHandler)(new AddMenuItemCommand(
            menuId: 'menu-1',
            menuItemId: self::ITEM_ID,
            dayKey: MenuWeekDay::MONDAY,
            meal: MenuItem::MEAL_LUNCH,
            kind: MenuItem::KIND_PRODUCT,
            refId: 'article-1',
            quantity: 120.0,
            unit: 'g',
            addedByUserId: 'god-user-id',
        ));
    }

    public function testItUpdatesOnlyTheTargetedItem(): void
    {
        $this->givenSingleMenu();
        ($this->addItemHandler)($this->addCommand());
        ($this->addItemHandler)($this->addCommand(menuItemId: self::OTHER_ITEM_ID, refId: 'article-2'));

        ($this->updateItemHandler)(new UpdateMenuItemCommand(
            menuId: 'menu-1',
            menuItemId: self::OTHER_ITEM_ID,
            quantity: 250.0,
            unit: 'ml',
            updatedByUserId: 'god-user-id',
        ));

        $menu = $this->menuRepository->findById(id: 'menu-1');
        $this->assertEquals(expected: 120.0, actual: $menu->items[0]->quantity);
        $this->assertEquals(expected: 'g', actual: $menu->items[0]->unit);
        $this->assertEquals(expected: 250.0, actual: $menu->items[1]->quantity);
        $this->assertEquals(expected: 'ml', actual: $menu->items[1]->unit);
    }

    public function testItRejectsANonPositiveQuantity(): void
    {
        $this->givenSingleMenu();
        ($this->addItemHandler)($this->addCommand());

        $this->expectException(exception: UpdateMenuException::class);

        ($this->updateItemHandler)(new UpdateMenuItemCommand(
            menuId: 'menu-1',
            menuItemId: self::ITEM_ID,
            quantity: 0.0,
            unit: 'g',
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItRemovesAnItemAndRepositionsTheRest(): void
    {
        $this->givenSingleMenu();
        ($this->addItemHandler)($this->addCommand());
        ($this->addItemHandler)($this->addCommand(menuItemId: self::OTHER_ITEM_ID, refId: 'article-2'));

        ($this->removeItemHandler)(new RemoveMenuItemCommand(
            menuId: 'menu-1',
            menuItemId: self::ITEM_ID,
            removedByUserId: 'god-user-id',
        ));

        $menu = $this->menuRepository->findById(id: 'menu-1');
        $this->assertCount(expectedCount: 1, haystack: $menu->items);
        $this->assertEquals(expected: self::OTHER_ITEM_ID, actual: $menu->items[0]->id);
        $this->assertEquals(expected: 1, actual: $menu->items[0]->position);
    }

    public function testRemovingAnAlreadyRemovedItemIsIdempotent(): void
    {
        $this->givenSingleMenu();

        ($this->removeItemHandler)(new RemoveMenuItemCommand(
            menuId: 'menu-1',
            menuItemId: self::ITEM_ID,
            removedByUserId: 'god-user-id',
        ));

        $menu = $this->menuRepository->findById(id: 'menu-1');
        $this->assertCount(expectedCount: 0, haystack: $menu->items);
    }

    public function testEmptyingAWeekDayDropsItFromThePlan(): void
    {
        $this->givenWeekMenu();

        ($this->addItemHandler)(new AddMenuItemCommand(
            menuId: 'menu-1',
            menuItemId: self::ITEM_ID,
            dayKey: MenuWeekDay::MONDAY,
            meal: MenuItem::MEAL_LUNCH,
            kind: MenuItem::KIND_PRODUCT,
            refId: 'article-1',
            quantity: 120.0,
            unit: 'g',
            addedByUserId: 'god-user-id',
        ));

        $this->assertEquals(
            expected: MenuWeekDay::MONDAY,
            actual: $this->menuRepository->findById(id: 'menu-1')->weekDays,
        );

        ($this->removeItemHandler)(new RemoveMenuItemCommand(
            menuId: 'menu-1',
            menuItemId: self::ITEM_ID,
            removedByUserId: 'god-user-id',
        ));

        $this->assertEquals(expected: '', actual: $this->menuRepository->findById(id: 'menu-1')->weekDays);
    }

    private function addCommand(string $menuItemId = self::ITEM_ID, string $refId = 'article-1'): AddMenuItemCommand
    {
        return new AddMenuItemCommand(
            menuId: 'menu-1',
            menuItemId: $menuItemId,
            dayKey: null,
            meal: MenuItem::MEAL_LUNCH,
            kind: MenuItem::KIND_PRODUCT,
            refId: $refId,
            quantity: 120.0,
            unit: 'g',
            addedByUserId: 'god-user-id',
        );
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
            items: [],
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));
    }
}
