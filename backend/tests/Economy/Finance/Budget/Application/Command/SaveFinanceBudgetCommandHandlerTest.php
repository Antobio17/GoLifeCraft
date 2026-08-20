<?php

namespace App\Tests\Economy\Finance\Budget\Application\Command;

use Economy\Finance\Budget\Application\Command\FinanceBudgetCategoryAssembler;
use Economy\Finance\Budget\Application\Command\FinanceBudgetCategoryData;
use Economy\Finance\Budget\Application\Command\SaveFinanceBudgetCommand;
use Economy\Finance\Budget\Application\Command\SaveFinanceBudgetCommandHandler;
use Economy\Finance\Budget\Domain\Event\FinanceBudgetCreated;
use Economy\Finance\Budget\Domain\Event\FinanceBudgetUpdated;
use Economy\Finance\Budget\Domain\Exception\SaveFinanceBudgetException;
use Economy\Finance\Budget\Domain\Model\FinanceBudgetCategory;
use Economy\Finance\Budget\Infrastructure\Domain\Model\InMemory\InMemoryFinanceBudgetRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class SaveFinanceBudgetCommandHandlerTest extends TestCase
{
    private InMemoryFinanceBudgetRepository $repository;
    private DomainEventCollectorService $domainEventCollectorService;

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceBudgetRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
    }

    public function testItCreatesTheBudgetTheFirstTimeItIsSaved(): void
    {
        ($this->buildHandler())($this->buildCommand());

        $budget = $this->repository->findCurrent();

        $this->assertNotNull(actual: $budget);
        $this->assertSame(expected: 2000.0, actual: $budget->referenceIncome);
        $this->assertSame(expected: 20.0, actual: $budget->savingsPercentage);
        $this->assertSame(expected: 400.0, actual: $budget->savingsAmount());
        $this->assertCount(expectedCount: 2, haystack: $budget->categories);
        $this->assertSame(expected: 'groceries', actual: $budget->categories[0]->category);
        $this->assertSame(expected: 1, actual: $budget->categories[0]->position);
        $this->assertSame(expected: FinanceBudgetCategory::KIND_FIXED, actual: $budget->categories[1]->kind);
    }

    public function testItRewritesTheOnlyBudgetInsteadOfAddingAnotherOne(): void
    {
        $handler = $this->buildHandler();

        $handler($this->buildCommand());
        $handler($this->buildCommand(
            referenceIncome: 2500.0,
            savingsPercentage: 10.0,
            categories: [['category' => 'transport', 'kind' => FinanceBudgetCategory::KIND_VARIABLE, 'amount' => 90.0]],
        ));

        $budget = $this->repository->findCurrent();

        $this->assertNotNull(actual: $budget);
        $this->assertSame(expected: 'finance-budget-1', actual: $budget->id);
        $this->assertSame(expected: 2500.0, actual: $budget->referenceIncome);
        $this->assertCount(expectedCount: 1, haystack: $budget->categories);
        $this->assertSame(expected: 'transport', actual: $budget->categories[0]->category);
    }

    public function testItRecordsTheCreationEventWithTheWholeDistribution(): void
    {
        ($this->buildHandler())($this->buildCommand());

        $events = $this->domainEventCollectorService->pullEvents();

        $this->assertCount(expectedCount: 1, haystack: $events);
        $this->assertInstanceOf(expected: FinanceBudgetCreated::class, actual: $events[0]);
        $this->assertSame(expected: 2000.0, actual: $events[0]->referenceIncome);
        $this->assertSame(expected: 400.0, actual: $events[0]->savingsAmount);
        $this->assertSame(expected: 1140.0, actual: $events[0]->allocatedAmount);
        $this->assertSame(expected: 860.0, actual: $events[0]->unassignedAmount);
        $this->assertCount(expectedCount: 2, haystack: $events[0]->categories);
    }

    public function testItRecordsAnUpdateEventWhenTheBudgetAlreadyExists(): void
    {
        $handler = $this->buildHandler();

        $handler($this->buildCommand());
        $this->domainEventCollectorService->pullEvents();

        $handler($this->buildCommand(savingsPercentage: 30.0));

        $events = $this->domainEventCollectorService->pullEvents();

        $this->assertCount(expectedCount: 1, haystack: $events);
        $this->assertInstanceOf(expected: FinanceBudgetUpdated::class, actual: $events[0]);
        $this->assertSame(expected: 600.0, actual: $events[0]->savingsAmount);
    }

    public function testItRejectsAReferenceIncomeThatIsNotPositive(): void
    {
        $this->expectException(exception: SaveFinanceBudgetException::class);

        ($this->buildHandler())($this->buildCommand(referenceIncome: 0.0));
    }

    public function testItRejectsASavingsPercentageOutOfRange(): void
    {
        $this->expectException(exception: SaveFinanceBudgetException::class);

        ($this->buildHandler())($this->buildCommand(savingsPercentage: 140.0));
    }

    public function testItRejectsAnUnsupportedCategory(): void
    {
        $this->expectException(exception: SaveFinanceBudgetException::class);

        ($this->buildHandler())($this->buildCommand(
            categories: [['category' => 'crypto', 'kind' => FinanceBudgetCategory::KIND_VARIABLE, 'amount' => 50.0]],
        ));
    }

    public function testItRejectsTheSameCategoryTwice(): void
    {
        $this->expectException(exception: SaveFinanceBudgetException::class);

        ($this->buildHandler())($this->buildCommand(categories: [
            ['category' => 'groceries', 'kind' => FinanceBudgetCategory::KIND_VARIABLE, 'amount' => 200.0],
            ['category' => 'groceries', 'kind' => FinanceBudgetCategory::KIND_VARIABLE, 'amount' => 100.0],
        ]));
    }

    public function testItRejectsADistributionBiggerThanTheReferenceIncome(): void
    {
        $this->expectException(exception: SaveFinanceBudgetException::class);

        ($this->buildHandler())($this->buildCommand(categories: [
            ['category' => 'groceries', 'kind' => FinanceBudgetCategory::KIND_VARIABLE, 'amount' => 1800.0],
        ]));
    }

    public function testItRejectsANegativeCategoryAmount(): void
    {
        $this->expectException(exception: SaveFinanceBudgetException::class);

        ($this->buildHandler())($this->buildCommand(categories: [
            ['category' => 'groceries', 'kind' => FinanceBudgetCategory::KIND_VARIABLE, 'amount' => -10.0],
        ]));
    }

    /**
     * @param array<int, array<string, mixed>>|null $categories
     */
    private function buildCommand(
        float $referenceIncome = 2000.0,
        float $savingsPercentage = 20.0,
        ?array $categories = null,
    ): SaveFinanceBudgetCommand {
        $categories ??= [
            ['category' => 'groceries', 'kind' => FinanceBudgetCategory::KIND_VARIABLE, 'amount' => 300.0],
            ['category' => 'bills', 'kind' => FinanceBudgetCategory::KIND_FIXED, 'amount' => 440.0],
        ];

        return new SaveFinanceBudgetCommand(
            referenceIncome: $referenceIncome,
            savingsPercentage: $savingsPercentage,
            categories: FinanceBudgetCategoryData::listFromArray(rawCategories: $categories),
            savedByUserId: 'god-user-id',
        );
    }

    private function buildHandler(): SaveFinanceBudgetCommandHandler
    {
        $dateTimeGenerator = new DateTimeGenerator();

        return new SaveFinanceBudgetCommandHandler(
            financeBudgetRepository: $this->repository,
            financeBudgetCategoryAssembler: new FinanceBudgetCategoryAssembler(
                dateTimeGenerator: $dateTimeGenerator,
            ),
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }
}
