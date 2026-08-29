<?php

namespace App\Tests\Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Application\Command\CheckProductionItemCommand;
use Nutrition\Kitchen\Production\Application\Command\CheckProductionItemCommandHandler;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemChecked;
use Nutrition\Kitchen\Production\Domain\Exception\CookProductionItemException;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Infrastructure\Domain\Model\InMemory\InMemoryProductionRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CheckProductionItemCommandHandlerTest extends TestCase
{
    private InMemoryProductionRepository $productionRepository;
    private DomainEventCollectorService $domainEventCollectorService;
    private DateTimeGenerator $dateTimeGenerator;
    private CheckProductionItemCommandHandler $handler;
    private Production $production;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->productionRepository = new InMemoryProductionRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new CheckProductionItemCommandHandler(
            productionRepository: $this->productionRepository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->production = Production::start(
            id: 'production-1',
            fromDate: '2026-08-26',
            toDate: '2026-08-28',
            items: [
                ProductionItem::plan(
                    productionId: 'production-1',
                    position: 1,
                    recipeId: 'recipe-1',
                    servingsPlanned: 2.0,
                    nameSnapshot: 'Lentejas con chorizo',
                    emojiSnapshot: '🍲',
                    createdByUserId: 'god-user-id',
                    dateTimeGenerator: $this->dateTimeGenerator,
                ),
            ],
            startedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->productionRepository->save(production: $this->production);
        $this->domainEventCollectorService->reset();
    }

    public function testItKeepsTheTickedIngredients(): void
    {
        ($this->handler)(new CheckProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(),
            articleIds: ['article-1', 'article-2'],
            stepPositions: [],
            checkedByUserId: 'god-user-id',
        ));

        $item = $this->production->item(itemId: $this->itemId());

        $this->assertSame(expected: ['article-1', 'article-2'], actual: $item->checkedArticleIds);

        $checked = $this->firstEventOf(class: ProductionItemChecked::class);

        $this->assertNotNull(actual: $checked);
        $this->assertSame(expected: ['article-1', 'article-2'], actual: $checked->checkedArticleIds);
    }

    public function testItReplacesTheWholeChecklistAndDropsDuplicates(): void
    {
        ($this->handler)(new CheckProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(),
            articleIds: ['article-1', 'article-2'],
            stepPositions: [],
            checkedByUserId: 'god-user-id',
        ));
        ($this->handler)(new CheckProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(),
            articleIds: ['article-2', 'article-2'],
            stepPositions: [],
            checkedByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: ['article-2'],
            actual: $this->production->item(itemId: $this->itemId())->checkedArticleIds,
        );
    }

    public function testItThrowsWhenTheRecipeIsAlreadyCooked(): void
    {
        $this->production->cookItem(
            itemId: $this->itemId(),
            servingsCooked: 2.0,
            consumedArticles: [],
            consumedRecipes: [],
            stepPositions: [],
            cookedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->expectException(exception: CookProductionItemException::class);

        ($this->handler)(new CheckProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(),
            articleIds: ['article-1'],
            stepPositions: [],
            checkedByUserId: 'god-user-id',
        ));
    }

    private function itemId(): string
    {
        return $this->production->items[0]->id;
    }

    private function firstEventOf(string $class): ?object
    {
        foreach ($this->domainEventCollectorService->pullEvents() as $event) {
            if ($event instanceof $class) {
                return $event;
            }
        }

        return null;
    }
}
