<?php

namespace App\Tests\Nutrition\GlobalCatalog\Article\Application\Command;

use Nutrition\GlobalCatalog\Article\Application\Command\UpsertGlobalArticleCommand;
use Nutrition\GlobalCatalog\Article\Application\Command\UpsertGlobalArticleCommandHandler;
use Nutrition\GlobalCatalog\Article\Infrastructure\Domain\Model\InMemory\InMemoryGlobalArticleRepository;
use PHPUnit\Framework\TestCase;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpsertGlobalArticleCommandHandlerTest extends TestCase
{
    private InMemoryGlobalArticleRepository $repository;
    private UpsertGlobalArticleCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryGlobalArticleRepository();
        $this->handler = new UpsertGlobalArticleCommandHandler(
            globalArticleRepository: $this->repository,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesGlobalArticleWhenBarcodeIsNew(): void
    {
        ($this->handler)($this->buildCommand(name: 'Leche entera', calories: 64.0));

        $globalArticle = $this->repository->findByBarcode(barcode: '8410000000001');

        $this->assertNotNull($globalArticle);
        $this->assertSame('Leche entera', $globalArticle->name);
        $this->assertSame(64.0, $globalArticle->calories);
        $this->assertSame('openfoodfacts', $globalArticle->source);
    }

    public function testItUpdatesExistingGlobalArticleKeepingSameId(): void
    {
        ($this->handler)($this->buildCommand(name: 'Leche entera', calories: 64.0));
        $created = $this->repository->findByBarcode(barcode: '8410000000001');

        ($this->handler)($this->buildCommand(name: 'Leche entera semidesnatada', calories: 46.0));
        $updated = $this->repository->findByBarcode(barcode: '8410000000001');

        $this->assertSame($created->id, $updated->id);
        $this->assertSame('Leche entera semidesnatada', $updated->name);
        $this->assertSame(46.0, $updated->calories);
    }

    private function buildCommand(string $name, float $calories): UpsertGlobalArticleCommand
    {
        return new UpsertGlobalArticleCommand(
            barcode: '8410000000001',
            name: $name,
            brand: 'Hacendado',
            categoryName: 'Lácteos',
            imageUrl: null,
            quantity: '1 L',
            stores: 'Mercadona',
            source: 'openfoodfacts',
            referenceAmount: 100.0,
            calories: $calories,
            protein: 3.1,
            carbs: 4.7,
            sugars: 4.7,
            fat: 3.6,
            saturatedFat: 2.3,
            fiber: 0.0,
            salt: 0.13,
        );
    }
}
