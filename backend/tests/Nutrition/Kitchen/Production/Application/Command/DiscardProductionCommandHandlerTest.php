<?php

namespace App\Tests\Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Application\Command\DiscardProductionCommand;
use Nutrition\Kitchen\Production\Application\Command\DiscardProductionCommandHandler;
use Nutrition\Kitchen\Production\Domain\Exception\DiscardProductionException;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Infrastructure\Domain\Model\InMemory\InMemoryProductionRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DiscardProductionCommandHandlerTest extends TestCase
{
    private InMemoryProductionRepository $productionRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private DiscardProductionCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->productionRepository = new InMemoryProductionRepository();
        $this->handler = new DiscardProductionCommandHandler(
            productionRepository: $this->productionRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->productionRepository->save(production: Production::start(
            id: 'production-1',
            recipeId: 'recipe-1',
            cookDate: '2026-08-26',
            servingsPlanned: 4.0,
            nameSnapshot: 'Lentejas con chorizo',
            emojiSnapshot: '🍲',
            startedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));
    }

    public function testItDiscardsTheProduction(): void
    {
        ($this->handler)(new DiscardProductionCommand(
            productionId: 'production-1',
            discardedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->productionRepository->findById(id: 'production-1'));
    }

    public function testItThrowsWhenTheProductionDoesNotExist(): void
    {
        $this->expectException(exception: DiscardProductionException::class);

        ($this->handler)(new DiscardProductionCommand(
            productionId: 'missing',
            discardedByUserId: 'god-user-id',
        ));
    }
}
