<?php

namespace App\Tests\Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Application\Command\ApplyWeekMenuCommand;
use Nutrition\Menu\Menu\Application\Command\ApplyWeekMenuCommandHandler;
use Nutrition\Menu\Menu\Application\Command\LoadMenuIntoDiaryCommand;
use Nutrition\Menu\Menu\Application\Command\LoadMenuIntoDiaryCommandHandler;
use Nutrition\Menu\Menu\Application\Command\MenuItemAssembler;
use Nutrition\Menu\Menu\Application\Command\MenuItemData;
use Nutrition\Menu\Menu\Domain\Event\MenuLoadedIntoDiary;
use Nutrition\Menu\Menu\Domain\Exception\LoadMenuIntoDiaryException;
use Nutrition\Menu\Menu\Domain\Model\Menu;
use Nutrition\Menu\Menu\Domain\Model\MenuItem;
use Nutrition\Menu\Menu\Domain\Model\MenuWeekDay;
use Nutrition\Menu\Menu\Infrastructure\Domain\Model\InMemory\InMemoryMenuRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class LoadMenuIntoDiaryCommandHandlerTest extends TestCase
{
    private DateTimeGenerator $dateTimeGenerator;
    private MenuItemAssembler $menuItemAssembler;
    private InMemoryMenuRepository $menuRepository;
    private DomainEventCollectorService $domainEventCollectorService;
    private LoadMenuIntoDiaryCommandHandler $handler;
    private ApplyWeekMenuCommandHandler $applyWeekHandler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->menuItemAssembler = new MenuItemAssembler(dateTimeGenerator: $this->dateTimeGenerator);
        $this->menuRepository = new InMemoryMenuRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new LoadMenuIntoDiaryCommandHandler(
            menuRepository: $this->menuRepository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->applyWeekHandler = new ApplyWeekMenuCommandHandler(
            menuRepository: $this->menuRepository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItPlansASingleMenuOnEveryDayOfTheRange(): void
    {
        $this->givenSingleMenu();

        ($this->handler)(new LoadMenuIntoDiaryCommand(
            menuId: 'menu-1',
            fromDate: '2026-08-03',
            toDate: '2026-08-05',
            dayKey: null,
            loadedByUserId: 'god-user-id',
        ));

        $event = $this->pullLoadedEvent();
        $this->assertCount(expectedCount: 3, haystack: $event->plannedDays);
        $this->assertEquals(expected: '2026-08-03', actual: $event->plannedDays[0]['date']);
        $this->assertEquals(expected: '2026-08-05', actual: $event->plannedDays[2]['date']);
        $this->assertEquals(expected: 'article-1', actual: $event->plannedDays[0]['items'][0]['refId']);
    }

    public function testItSwapsAnInvertedRange(): void
    {
        $this->givenSingleMenu();

        ($this->handler)(new LoadMenuIntoDiaryCommand(
            menuId: 'menu-1',
            fromDate: '2026-08-05',
            toDate: '2026-08-03',
            dayKey: null,
            loadedByUserId: 'god-user-id',
        ));

        $event = $this->pullLoadedEvent();
        $this->assertEquals(expected: '2026-08-03', actual: $event->plannedDays[0]['date']);
        $this->assertCount(expectedCount: 3, haystack: $event->plannedDays);
    }

    public function testItPlansOnlyTheRequestedWeekDay(): void
    {
        $this->givenWeekMenu();

        ($this->handler)(new LoadMenuIntoDiaryCommand(
            menuId: 'menu-1',
            fromDate: '2026-08-03',
            toDate: '2026-08-03',
            dayKey: MenuWeekDay::TUESDAY,
            loadedByUserId: 'god-user-id',
        ));

        $event = $this->pullLoadedEvent();
        $this->assertCount(expectedCount: 1, haystack: $event->plannedDays);
        $this->assertEquals(expected: 'article-tue', actual: $event->plannedDays[0]['items'][0]['refId']);
    }

    public function testItFailsWhenTheRequestedWeekDayIsNotInThePlan(): void
    {
        $this->givenWeekMenu();

        $this->expectException(exception: LoadMenuIntoDiaryException::class);

        ($this->handler)(new LoadMenuIntoDiaryCommand(
            menuId: 'menu-1',
            fromDate: '2026-08-03',
            toDate: '2026-08-03',
            dayKey: MenuWeekDay::SUNDAY,
            loadedByUserId: 'god-user-id',
        ));
    }

    public function testItFailsWhenTheMenuHasNoItems(): void
    {
        $this->menuRepository->save(menu: Menu::create(
            id: 'menu-1',
            name: 'Vacío',
            emoji: '🍽️',
            note: '',
            type: Menu::TYPE_SINGLE,
            items: [],
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));

        $this->expectException(exception: LoadMenuIntoDiaryException::class);

        ($this->handler)(new LoadMenuIntoDiaryCommand(
            menuId: 'menu-1',
            fromDate: '2026-08-03',
            toDate: '2026-08-03',
            dayKey: null,
            loadedByUserId: 'god-user-id',
        ));
    }

    public function testItAppliesEachActiveDayOnItsWeekDate(): void
    {
        $this->givenWeekMenu();

        ($this->applyWeekHandler)(new ApplyWeekMenuCommand(
            menuId: 'menu-1',
            weekStartDate: '2026-08-03',
            loadedByUserId: 'god-user-id',
        ));

        $event = $this->pullLoadedEvent();
        $this->assertCount(expectedCount: 2, haystack: $event->plannedDays);
        $this->assertEquals(expected: '2026-08-03', actual: $event->plannedDays[0]['date']);
        $this->assertEquals(expected: '2026-08-04', actual: $event->plannedDays[1]['date']);
        $this->assertEquals(expected: 'article-tue', actual: $event->plannedDays[1]['items'][0]['refId']);
    }

    public function testItRejectsApplyingAWeekOnASingleMenu(): void
    {
        $this->givenSingleMenu();

        $this->expectException(exception: LoadMenuIntoDiaryException::class);

        ($this->applyWeekHandler)(new ApplyWeekMenuCommand(
            menuId: 'menu-1',
            weekStartDate: '2026-08-03',
            loadedByUserId: 'god-user-id',
        ));
    }

    private function pullLoadedEvent(): MenuLoadedIntoDiary
    {
        $events = $this->domainEventCollectorService->pullEvents();
        $loadedEvents = array_values(array_filter(
            $events,
            static fn ($event): bool => $event instanceof MenuLoadedIntoDiary,
        ));

        $this->assertCount(expectedCount: 1, haystack: $loadedEvents);

        return $loadedEvents[0];
    }

    private function givenSingleMenu(): void
    {
        $this->menuRepository->save(menu: Menu::create(
            id: 'menu-1',
            name: 'Día alto en proteína',
            emoji: '🍗',
            note: '',
            type: Menu::TYPE_SINGLE,
            items: $this->menuItemAssembler->assemble(
                menuId: 'menu-1',
                items: [
                    new MenuItemData(
                        dayKey: null,
                        meal: MenuItem::MEAL_DINNER,
                        kind: MenuItem::KIND_PRODUCT,
                        refId: 'article-1',
                        quantity: 180.0,
                        position: 1,
                        unit: 'g',
                    ),
                ],
                userId: 'god-user-id',
            ),
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
            items: $this->menuItemAssembler->assemble(
                menuId: 'menu-1',
                items: [
                    new MenuItemData(
                        dayKey: MenuWeekDay::MONDAY,
                        meal: MenuItem::MEAL_LUNCH,
                        kind: MenuItem::KIND_RECIPE,
                        refId: 'recipe-mon',
                        quantity: 1.0,
                        position: 1,
                    ),
                    new MenuItemData(
                        dayKey: MenuWeekDay::TUESDAY,
                        meal: MenuItem::MEAL_DINNER,
                        kind: MenuItem::KIND_PRODUCT,
                        refId: 'article-tue',
                        quantity: 150.0,
                        position: 2,
                        unit: 'g',
                    ),
                ],
                userId: 'god-user-id',
            ),
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));
    }
}
