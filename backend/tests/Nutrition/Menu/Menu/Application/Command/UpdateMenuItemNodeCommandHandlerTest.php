<?php

namespace App\Tests\Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Application\Command\MenuItemAssembler;
use Nutrition\Menu\Menu\Application\Command\MenuItemData;
use Nutrition\Menu\Menu\Application\Command\ResetMenuItemTreeCommand;
use Nutrition\Menu\Menu\Application\Command\ResetMenuItemTreeCommandHandler;
use Nutrition\Menu\Menu\Application\Command\UpdateMenuItemCommand;
use Nutrition\Menu\Menu\Application\Command\UpdateMenuItemCommandHandler;
use Nutrition\Menu\Menu\Application\Command\UpdateMenuItemNodeCommand;
use Nutrition\Menu\Menu\Application\Command\UpdateMenuItemNodeCommandHandler;
use Nutrition\Menu\Menu\Domain\Exception\UpdateMenuException;
use Nutrition\Menu\Menu\Domain\Model\Menu;
use Nutrition\Menu\Menu\Domain\Model\MenuItem;
use Nutrition\Menu\Menu\Domain\Model\MenuItemNode;
use Nutrition\Menu\Menu\Infrastructure\Domain\Model\InMemory\InMemoryMenuRepository;
use Nutrition\Menu\Menu\Infrastructure\Domain\Service\InMemoryMenuItemTreeBuilder;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateMenuItemNodeCommandHandlerTest extends TestCase
{
    private const string MENU_ID = 'menu-1';

    private const string USER_ID = 'god-user-id';

    private DateTimeGenerator $dateTimeGenerator;

    private InMemoryMenuRepository $menuRepository;

    private DomainEventCollectorService $domainEventCollectorService;

    private UpdateMenuItemNodeCommandHandler $handler;

    private ResetMenuItemTreeCommandHandler $resetHandler;

    private UpdateMenuItemCommandHandler $updateItemHandler;

    private string $recipeItemId;

    private string $productItemId;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->menuRepository = new InMemoryMenuRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();

        $treeBuilder = (new InMemoryMenuItemTreeBuilder())
            ->withItem(
                recipeId: 'recipe-1',
                kind: MenuItemNode::KIND_PRODUCT,
                refId: 'article-rice',
                parentPath: null,
                position: 0,
                quantity: 200.0,
                unit: 'g',
                name: 'Arroz',
                emoji: '🍚',
                macros: new MacroBreakdown(calories: 200.0, protein: 8.0, fat: 2.0, carbs: 40.0),
            )
            ->withItem(
                recipeId: 'recipe-1',
                kind: MenuItemNode::KIND_RECIPE,
                refId: 'recipe-sauce',
                parentPath: null,
                position: 1,
                quantity: 1.0,
                unit: null,
                name: 'Salsa',
                emoji: '🥫',
                macros: new MacroBreakdown(calories: 100.0, protein: 4.0, fat: 2.0, carbs: 20.0),
            )
            ->withItem(
                recipeId: 'recipe-1',
                kind: MenuItemNode::KIND_PRODUCT,
                refId: 'article-tomato',
                parentPath: '1',
                position: 0,
                quantity: 50.0,
                unit: 'g',
                name: 'Tomate',
                emoji: '🍅',
                macros: new MacroBreakdown(calories: 100.0, protein: 4.0, fat: 2.0, carbs: 20.0),
            );

        $this->givenMenuWithARecipeAndAProduct();

        $this->handler = new UpdateMenuItemNodeCommandHandler(
            menuRepository: $this->menuRepository,
            treeBuilder: $treeBuilder,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->resetHandler = new ResetMenuItemTreeCommandHandler(
            menuRepository: $this->menuRepository,
            treeBuilder: $treeBuilder,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->updateItemHandler = new UpdateMenuItemCommandHandler(
            menuRepository: $this->menuRepository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItMaterializesTheBreakdownOnTheFirstAdjustment(): void
    {
        ($this->handler)(new UpdateMenuItemNodeCommand(
            menuId: self::MENU_ID,
            menuItemId: $this->recipeItemId,
            nodePath: '0',
            quantity: 100.0,
            unit: 'g',
            updatedByUserId: self::USER_ID,
        ));

        $item = $this->recipeItem();
        $rice = $item->findNode(nodePath: '0');

        $this->assertCount(expectedCount: 3, haystack: $item->nodes);
        $this->assertTrue(condition: $item->customized);
        $this->assertSame(expected: 100.0, actual: $rice->quantity);
        $this->assertSame(expected: 100.0, actual: $rice->caloriesSnapshot);
        $this->assertSame(expected: 200.0, actual: $item->treeMacros()->calories);
        $this->assertNotEmpty(actual: $this->domainEventCollectorService->pullEvents());
    }

    public function testItScalesTheChildrenOfANestedRecipeNode(): void
    {
        ($this->handler)(new UpdateMenuItemNodeCommand(
            menuId: self::MENU_ID,
            menuItemId: $this->recipeItemId,
            nodePath: '1',
            quantity: 2.0,
            unit: null,
            updatedByUserId: self::USER_ID,
        ));

        $item = $this->recipeItem();
        $tomato = $item->findNode(nodePath: '1.0');
        $sauce = $item->findNode(nodePath: '1');

        $this->assertSame(expected: 100.0, actual: $tomato->quantity);
        $this->assertSame(expected: 200.0, actual: $tomato->caloriesSnapshot);
        $this->assertSame(expected: 200.0, actual: $sauce->caloriesSnapshot);
        $this->assertSame(expected: 400.0, actual: $item->treeMacros()->calories);
    }

    public function testItRestoresTheOriginalBreakdown(): void
    {
        ($this->handler)(new UpdateMenuItemNodeCommand(
            menuId: self::MENU_ID,
            menuItemId: $this->recipeItemId,
            nodePath: '0',
            quantity: 500.0,
            unit: 'g',
            updatedByUserId: self::USER_ID,
        ));

        ($this->resetHandler)(new ResetMenuItemTreeCommand(
            menuId: self::MENU_ID,
            menuItemId: $this->recipeItemId,
            updatedByUserId: self::USER_ID,
        ));

        $item = $this->recipeItem();

        $this->assertFalse(condition: $item->customized);
        $this->assertSame(expected: 200.0, actual: $item->findNode(nodePath: '0')->quantity);
        $this->assertSame(expected: 300.0, actual: $item->treeMacros()->calories);
    }

    public function testItKeepsTheBreakdownWhenTheItemIsSavedAgain(): void
    {
        ($this->handler)(new UpdateMenuItemNodeCommand(
            menuId: self::MENU_ID,
            menuItemId: $this->recipeItemId,
            nodePath: '0',
            quantity: 100.0,
            unit: 'g',
            updatedByUserId: self::USER_ID,
        ));

        ($this->updateItemHandler)(new UpdateMenuItemCommand(
            menuId: self::MENU_ID,
            menuItemId: $this->recipeItemId,
            quantity: 1.0,
            unit: null,
            updatedByUserId: self::USER_ID,
        ));

        $item = $this->recipeItem();

        $this->assertTrue(condition: $item->customized);
        $this->assertSame(expected: 100.0, actual: $item->findNode(nodePath: '0')->quantity);
    }

    public function testItScalesTheBreakdownWhenTheServingsChange(): void
    {
        ($this->handler)(new UpdateMenuItemNodeCommand(
            menuId: self::MENU_ID,
            menuItemId: $this->recipeItemId,
            nodePath: '0',
            quantity: 100.0,
            unit: 'g',
            updatedByUserId: self::USER_ID,
        ));

        ($this->updateItemHandler)(new UpdateMenuItemCommand(
            menuId: self::MENU_ID,
            menuItemId: $this->recipeItemId,
            quantity: 2.0,
            unit: null,
            updatedByUserId: self::USER_ID,
        ));

        $item = $this->recipeItem();

        $this->assertSame(expected: 200.0, actual: $item->findNode(nodePath: '0')->quantity);
        $this->assertSame(expected: 100.0, actual: $item->findNode(nodePath: '1.0')->quantity);
    }

    public function testItCarriesTheBreakdownWhenTheMenuIsLoadedIntoTheDiary(): void
    {
        ($this->handler)(new UpdateMenuItemNodeCommand(
            menuId: self::MENU_ID,
            menuItemId: $this->recipeItemId,
            nodePath: '0',
            quantity: 100.0,
            unit: 'g',
            updatedByUserId: self::USER_ID,
        ));

        $planned = $this->recipeItem()->toPlannedItem();

        $this->assertCount(expectedCount: 3, haystack: $planned['tree']);
        $this->assertSame(expected: 100.0, actual: $planned['tree'][0]['quantity']);
    }

    public function testItRefusesToAdjustAProductItem(): void
    {
        $this->expectException(exception: UpdateMenuException::class);

        ($this->handler)(new UpdateMenuItemNodeCommand(
            menuId: self::MENU_ID,
            menuItemId: $this->productItemId,
            nodePath: '0',
            quantity: 100.0,
            unit: 'g',
            updatedByUserId: self::USER_ID,
        ));
    }

    public function testItThrowsWhenTheNodeDoesNotExist(): void
    {
        $this->expectException(exception: UpdateMenuException::class);

        ($this->handler)(new UpdateMenuItemNodeCommand(
            menuId: self::MENU_ID,
            menuItemId: $this->recipeItemId,
            nodePath: '9',
            quantity: 100.0,
            unit: 'g',
            updatedByUserId: self::USER_ID,
        ));
    }

    public function testItThrowsWhenTheQuantityIsNotPositive(): void
    {
        $this->expectException(exception: UpdateMenuException::class);

        ($this->handler)(new UpdateMenuItemNodeCommand(
            menuId: self::MENU_ID,
            menuItemId: $this->recipeItemId,
            nodePath: '0',
            quantity: 0.0,
            unit: 'g',
            updatedByUserId: self::USER_ID,
        ));
    }

    private function recipeItem(): MenuItem
    {
        return $this->menuRepository->findById(id: self::MENU_ID)->recipeItem(menuItemId: $this->recipeItemId);
    }

    private function givenMenuWithARecipeAndAProduct(): void
    {
        $items = (new MenuItemAssembler(dateTimeGenerator: $this->dateTimeGenerator))->assemble(
            menuId: self::MENU_ID,
            items: [
                new MenuItemData(
                    dayKey: null,
                    meal: MenuItem::MEAL_LUNCH,
                    kind: MenuItem::KIND_RECIPE,
                    refId: 'recipe-1',
                    quantity: 1.0,
                    position: 1,
                ),
                new MenuItemData(
                    dayKey: null,
                    meal: MenuItem::MEAL_DINNER,
                    kind: MenuItem::KIND_PRODUCT,
                    refId: 'article-rice',
                    quantity: 150.0,
                    position: 2,
                    unit: 'g',
                ),
            ],
            userId: self::USER_ID,
        );

        $this->recipeItemId = $items[0]->id;
        $this->productItemId = $items[1]->id;

        $this->menuRepository->save(menu: Menu::create(
            id: self::MENU_ID,
            name: 'Día alto en proteína',
            emoji: '🍗',
            note: '',
            type: Menu::TYPE_SINGLE,
            items: $items,
            createdByUserId: self::USER_ID,
            dateTimeGenerator: $this->dateTimeGenerator,
        ));
    }
}
