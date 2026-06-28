<?php

namespace App\Tests\Mcp\Server\Mcp\Application\Command;

use App\Tests\Mcp\Server\Mcp\Support\ProductMetadata;
use Mcp\Server\Mcp\Application\Command\WriteModelCommand;
use Mcp\Server\Mcp\Application\Command\WriteModelCommandHandler;
use Mcp\Server\Mcp\Domain\Event\ModelWritten;
use Mcp\Server\Mcp\Domain\Exception\ModelValidationException;
use Mcp\Server\Mcp\Domain\Service\ModelValidator;
use Mcp\Server\Mcp\Infrastructure\Domain\Model\InMemory\InMemoryGenericModelRepository;
use Mcp\Server\Mcp\Infrastructure\Domain\QueryModel\InMemory\InMemoryWriteModelNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Product\Catalog\Product\Domain\Model\Product;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class WriteModelCommandHandlerTest extends TestCase
{
    private InMemoryGenericModelRepository $repository;
    private InMemoryWriteModelNeedleDataQuery $writeModelNeedleDataQuery;
    private DomainEventCollectorService $domainEventCollectorService;
    private WriteModelCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryGenericModelRepository();
        $this->writeModelNeedleDataQuery = new InMemoryWriteModelNeedleDataQuery();
        $this->domainEventCollectorService = new DomainEventCollectorService();

        $this->handler = new WriteModelCommandHandler(
            metadataProvider: new ProductMetadata(),
            validator: new ModelValidator(writeModelNeedleDataQuery: $this->writeModelNeedleDataQuery),
            repository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesAModel(): void
    {
        ($this->handler)(new WriteModelCommand(
            entityAlias: 'product',
            data: ['name' => 'Barrita proteica', 'status' => 'published', 'calories' => 240],
            id: null,
            userSessionId: 'user-1',
        ));

        $products = $this->repository->saved;
        self::assertCount(1, $products);

        $product = array_values($products)[0];
        self::assertInstanceOf(Product::class, $product);
        self::assertSame('Barrita proteica', $product->name);
        self::assertSame('user-1', $product->createdByUserId);

        $events = $this->domainEventCollectorService->pullEvents();
        self::assertCount(1, $events);
        self::assertInstanceOf(ModelWritten::class, $events[0]);
        self::assertSame('created', $events[0]->operation);
        self::assertSame('Barrita proteica', $events[0]->entitySnapshot['name']);
        self::assertSame('published', $events[0]->entitySnapshot['status']);
        self::assertSame(240, $events[0]->entitySnapshot['calories']);
    }

    public function testItUpdatesAModel(): void
    {
        $product = $this->seedProduct(id: 'product-1');

        ($this->handler)(new WriteModelCommand(
            entityAlias: 'product',
            data: ['name' => 'Barrita XL'],
            id: 'product-1',
            userSessionId: 'user-2',
        ));

        self::assertSame('Barrita XL', $product->name);
        self::assertSame('user-2', $product->updatedByUserId);

        $events = $this->domainEventCollectorService->pullEvents();
        self::assertCount(1, $events);
        self::assertSame('updated', $events[0]->operation);
        self::assertSame('Barrita XL', $events[0]->entitySnapshot['name']);
    }

    public function testItFailsWhenRequiredFieldIsMissing(): void
    {
        $this->expectException(ModelValidationException::class);

        ($this->handler)(new WriteModelCommand(
            entityAlias: 'product',
            data: ['name' => 'Only the name'],
            id: null,
            userSessionId: 'user-1',
        ));
    }

    public function testItRejectsUnknownFields(): void
    {
        $this->expectException(ModelValidationException::class);

        ($this->handler)(new WriteModelCommand(
            entityAlias: 'product',
            data: ['name' => 'Valid name', 'status' => 'draft', 'secret' => 'x'],
            id: null,
            userSessionId: 'user-1',
        ));
    }

    private function seedProduct(string $id): Product
    {
        $product = new Product();
        $product->id = $id;
        $product->name = 'Barrita';
        $product->status = 'draft';
        $product->createdAt = new \DateTime();
        $product->updatedAt = new \DateTime();
        $product->createdByUserId = 'user-1';
        $product->updatedByUserId = 'user-1';

        $this->repository->save(entity: $product);

        return $product;
    }
}
