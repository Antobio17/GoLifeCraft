<?php

namespace App\Tests\Nutrition\GlobalCatalog\Article\Application\Command;

use Authorization\User\User\Domain\Model\User;
use Nutrition\GlobalCatalog\Article\Application\Command\UpdateGlobalArticleCommand;
use Nutrition\GlobalCatalog\Article\Application\Command\UpdateGlobalArticleCommandHandler;
use Nutrition\GlobalCatalog\Article\Domain\Event\GlobalArticleUpdated;
use Nutrition\GlobalCatalog\Article\Domain\Exception\UpdateGlobalArticleAccessException;
use Nutrition\GlobalCatalog\Article\Domain\Exception\UpdateGlobalArticleException;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticle;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticleNutrition;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticlePricing;
use Nutrition\GlobalCatalog\Article\Infrastructure\Domain\Model\InMemory\InMemoryGlobalArticleRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateGlobalArticleCommandHandlerTest extends TestCase
{
    private const string GLOBAL_ARTICLE_ID = 'global-article-1';

    private InMemoryGlobalArticleRepository $repository;
    private DomainEventCollectorService $domainEventCollectorService;
    private UpdateGlobalArticleCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->repository = new InMemoryGlobalArticleRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->repository->save(globalArticle: GlobalArticle::create(
            id: self::GLOBAL_ARTICLE_ID,
            barcode: '8480000000024',
            name: 'Yogur griego',
            brand: 'Hacendado',
            categoryName: 'Lácteos y huevos',
            imageUrl: 'https://example.test/yogur.jpg',
            quantity: '6 x 125 g',
            stores: null,
            pricing: new GlobalArticlePricing(price: 1.55, bulkPrice: 2.07, referencePrice: 2.07, referenceFormat: 'kg', previousPrice: null),
            source: 'mercadona',
            nutrition: new GlobalArticleNutrition(
                referenceAmount: 100.0,
                calories: 120.0,
                protein: 3.5,
                carbs: 4.0,
                sugars: 4.0,
                fat: 10.0,
                saturatedFat: 6.6,
                fiber: null,
                salt: 0.1,
            ),
            dateTimeGenerator: $dateTimeGenerator,
        ));

        $this->handler = new UpdateGlobalArticleCommandHandler(
            globalArticleRepository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItCorrectsTheGlobalArticleKeepingItsReferenceAmountAndBulkPrice(): void
    {
        ($this->handler)($this->buildCommand(name: '  Yogur griego natural  ', protein: 5.2));

        $globalArticle = $this->repository->findById(id: self::GLOBAL_ARTICLE_ID);

        $this->assertSame('Yogur griego natural', $globalArticle->name);
        $this->assertSame(5.2, $globalArticle->protein);
        $this->assertSame(1.4, $globalArticle->price);
        $this->assertSame(1.55, $globalArticle->previousPrice);
        $this->assertSame(2.07, $globalArticle->bulkPrice);
        $this->assertSame(100.0, $globalArticle->referenceAmount);
        $this->assertSame('god-user', $globalArticle->updatedByUserId);
    }

    public function testItRecordsTheCompleteUpdatedEvent(): void
    {
        ($this->handler)($this->buildCommand(name: 'Yogur griego natural', protein: 5.2));

        $events = $this->domainEventCollectorService->pullEvents();

        $this->assertCount(1, $events);
        $this->assertInstanceOf(GlobalArticleUpdated::class, $events[0]);
        $this->assertSame('Yogur griego natural', $events[0]->name);
        $this->assertSame('8480000000024', $events[0]->barcode);
        $this->assertSame('https://example.test/yogur.jpg', $events[0]->imageUrl);
        $this->assertSame(5.2, $events[0]->protein);
        $this->assertSame('god-user', $events[0]->updatedByUserId);
    }

    public function testItRejectsUsersThatAreNotAdministrators(): void
    {
        $this->expectException(UpdateGlobalArticleAccessException::class);

        ($this->handler)($this->buildCommand(name: 'Yogur griego natural', protein: 5.2, userRole: User::ROLE_USER));
    }

    public function testItRejectsAnEmptyName(): void
    {
        $this->expectException(UpdateGlobalArticleException::class);

        ($this->handler)($this->buildCommand(name: '   ', protein: 5.2));
    }

    public function testItRejectsNegativeNutritionValues(): void
    {
        $this->expectException(UpdateGlobalArticleException::class);

        ($this->handler)($this->buildCommand(name: 'Yogur griego natural', protein: -1.0));
    }

    public function testItFailsWhenTheGlobalArticleDoesNotExist(): void
    {
        $this->expectException(UpdateGlobalArticleException::class);

        ($this->handler)($this->buildCommand(name: 'Yogur griego natural', protein: 5.2, globalArticleId: 'missing'));
    }

    private function buildCommand(
        string $name,
        float $protein,
        string $userRole = User::ROLE_GOD,
        string $globalArticleId = self::GLOBAL_ARTICLE_ID,
    ): UpdateGlobalArticleCommand {
        return new UpdateGlobalArticleCommand(
            globalArticleId: $globalArticleId,
            name: $name,
            brand: 'Hacendado',
            categoryName: 'Lácteos y huevos',
            quantity: '6 x 125 g',
            price: 1.4,
            previousPrice: 1.55,
            referencePrice: 1.87,
            referenceFormat: 'kg',
            calories: 120.0,
            protein: $protein,
            carbs: 4.0,
            sugars: 4.0,
            fat: 10.0,
            saturatedFat: 6.6,
            fiber: null,
            salt: 0.1,
            updatedByUserId: 'god-user',
            userRole: $userRole,
        );
    }
}
