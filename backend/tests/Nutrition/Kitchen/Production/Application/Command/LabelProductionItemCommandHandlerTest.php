<?php

namespace App\Tests\Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Application\Command\CookProductionItemCommand;
use Nutrition\Kitchen\Production\Application\Command\CookProductionItemCommandHandler;
use Nutrition\Kitchen\Production\Application\Command\LabelProductionItemCommand;
use Nutrition\Kitchen\Production\Application\Command\LabelProductionItemCommandHandler;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemLabelled;
use Nutrition\Kitchen\Production\Domain\Exception\AdjustProductionItemException;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Infrastructure\Domain\Model\InMemory\InMemoryProductionRepository;
use Nutrition\Kitchen\Production\Infrastructure\Domain\Service\InMemory\InMemoryProductionCompositionResolver;
use Nutrition\Kitchen\Production\Infrastructure\Domain\Service\InMemory\InMemoryProductionLotAllocator;
use Nutrition\Kitchen\Production\Infrastructure\Domain\Service\InMemory\InMemoryProductionLotCodeGenerator;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class LabelProductionItemCommandHandlerTest extends TestCase
{
    private InMemoryProductionRepository $productionRepository;
    private DomainEventCollectorService $domainEventCollectorService;
    private LabelProductionItemCommandHandler $handler;
    private CookProductionItemCommandHandler $cookHandler;
    private Production $production;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $compositionResolver = new InMemoryProductionCompositionResolver();
        $compositionResolver->addIngredient(recipeId: 'recipe-1', articleId: 'article-lentils', quantityPerServing: 80.0);

        $this->productionRepository = new InMemoryProductionRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new LabelProductionItemCommandHandler(
            productionRepository: $this->productionRepository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->cookHandler = new CookProductionItemCommandHandler(
            productionRepository: $this->productionRepository,
            compositionResolver: $compositionResolver,
            lotCodeGenerator: new InMemoryProductionLotCodeGenerator(),
            lotAllocator: new InMemoryProductionLotAllocator(),
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
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
                    composition: $compositionResolver->fromRecipe(recipeId: 'recipe-1', servings: 2.0),
                    createdByUserId: 'god-user-id',
                    dateTimeGenerator: $dateTimeGenerator,
                ),
            ],
            startedByUserId: 'god-user-id',
            dateTimeGenerator: $dateTimeGenerator,
        );

        $this->productionRepository->save(production: $this->production);
        $this->domainEventCollectorService->reset();
    }

    public function testItWritesWhereTheBatchIsStored(): void
    {
        ($this->handler)(new LabelProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(),
            label: 'congelador cajón 2',
            labelledByUserId: 'god-user-id',
        ));

        $this->assertSame(expected: 'congelador cajón 2', actual: $this->production->item(itemId: $this->itemId())->label);

        $event = $this->firstEventOf(class: ProductionItemLabelled::class);

        $this->assertNotNull(actual: $event);
        $this->assertSame(expected: 'congelador cajón 2', actual: $event->label);
    }

    public function testItTrimsTheLabelAndCutsItToTheStoredLength(): void
    {
        ($this->handler)(new LabelProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(),
            label: '  '.str_repeat(string: 'á', times: ProductionItem::LABEL_MAX_LENGTH + 10).'  ',
            labelledByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: str_repeat(string: 'á', times: ProductionItem::LABEL_MAX_LENGTH),
            actual: $this->production->item(itemId: $this->itemId())->label,
        );
    }

    public function testACookedBatchCanStillBeLabelled(): void
    {
        ($this->cookHandler)(new CookProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(),
            servingsCooked: 2.0,
            cookedByUserId: 'god-user-id',
        ));
        $this->domainEventCollectorService->reset();

        ($this->handler)(new LabelProductionItemCommand(
            productionId: 'production-1',
            itemId: $this->itemId(),
            label: '3 tuppers',
            labelledByUserId: 'god-user-id',
        ));

        $event = $this->firstEventOf(class: ProductionItemLabelled::class);

        $this->assertSame(expected: '3 tuppers', actual: $event->label);
        $this->assertSame(expected: 'L-001', actual: $event->code);
    }

    public function testItThrowsWhenTheProductionDoesNotContainThatBatch(): void
    {
        $this->expectException(exception: AdjustProductionItemException::class);

        ($this->handler)(new LabelProductionItemCommand(
            productionId: 'production-1',
            itemId: 'missing-item-id',
            label: '3 tuppers',
            labelledByUserId: 'god-user-id',
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
