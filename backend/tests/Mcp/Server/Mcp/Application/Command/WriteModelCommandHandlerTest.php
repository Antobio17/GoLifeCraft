<?php

namespace App\Tests\Mcp\Server\Mcp\Application\Command;

use App\Tests\Mcp\Server\Mcp\Support\ProductMetadata;
use Mcp\Server\Mcp\Application\Command\WriteModelCommand;
use Mcp\Server\Mcp\Application\Command\WriteModelCommandHandler;
use Mcp\Server\Mcp\Domain\Event\ModelWritten;
use Mcp\Server\Mcp\Domain\Exception\ModelValidationException;
use Mcp\Server\Mcp\Domain\Exception\WriteModelException;
use Mcp\Server\Mcp\Domain\Service\ModelHydrator;
use Mcp\Server\Mcp\Domain\Service\ModelValidator;
use Mcp\Server\Mcp\Infrastructure\Domain\Model\InMemory\InMemoryGenericModelRepository;
use Mcp\Server\Mcp\Infrastructure\Domain\QueryModel\InMemory\InMemoryModelExistsNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Product\Catalog\Product\Domain\Model\Product;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class WriteModelCommandHandlerTest extends TestCase
{
    private InMemoryGenericModelRepository $repository;
    private InMemoryModelExistsNeedleDataQuery $existsNeedleDataQuery;
    private DomainEventCollectorService $domainEventCollectorService;
    private WriteModelCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryGenericModelRepository();
        $this->existsNeedleDataQuery = new InMemoryModelExistsNeedleDataQuery();
        $this->domainEventCollectorService = new DomainEventCollectorService();

        $this->handler = new WriteModelCommandHandler(
            metadataProvider: new ProductMetadata(),
            validator: new ModelValidator(existsNeedleDataQuery: $this->existsNeedleDataQuery),
            hydrator: new ModelHydrator(repository: $this->repository),
            repository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesAModel(): void
    {
        $result = ($this->handler)(new WriteModelCommand(
            entityAlias: 'product',
            data: ['name' => 'Barrita proteica', 'status' => 'published', 'calories' => 240],
            id: null,
            expectedVersion: null,
            userSessionId: 'user-1',
            tenantSessionId: 'tenant-1',
        ));

        self::assertSame('created', $result['operation']);
        self::assertSame(1, $result['version']);

        $product = $this->repository->saved[$result['id']];
        self::assertInstanceOf(Product::class, $product);
        self::assertSame('Barrita proteica', $product->name);
        self::assertSame('user-1', $product->createdByUserId);

        $events = $this->domainEventCollectorService->pullEvents();
        self::assertCount(1, $events);
        self::assertInstanceOf(ModelWritten::class, $events[0]);
        self::assertSame('created', $events[0]->operation);
    }

    public function testItUpdatesAModel(): void
    {
        $product = $this->seedProduct(id: 'product-1');

        $result = ($this->handler)(new WriteModelCommand(
            entityAlias: 'product',
            data: ['name' => 'Barrita XL'],
            id: 'product-1',
            expectedVersion: 1,
            userSessionId: 'user-2',
            tenantSessionId: 'tenant-1',
        ));

        self::assertSame('updated', $result['operation']);
        self::assertSame(2, $result['version']);
        self::assertSame('Barrita XL', $product->name);
        self::assertSame('user-2', $product->updatedByUserId);
    }

    public function testItRejectsAVersionConflict(): void
    {
        $this->seedProduct(id: 'product-1');

        $this->expectException(WriteModelException::class);

        ($this->handler)(new WriteModelCommand(
            entityAlias: 'product',
            data: ['name' => 'Barrita XL'],
            id: 'product-1',
            expectedVersion: 9,
            userSessionId: 'user-2',
            tenantSessionId: 'tenant-1',
        ));
    }

    public function testItRequiresExpectedVersionOnUpdate(): void
    {
        $this->seedProduct(id: 'product-1');

        $this->expectException(WriteModelException::class);

        ($this->handler)(new WriteModelCommand(
            entityAlias: 'product',
            data: ['name' => 'Barrita XL'],
            id: 'product-1',
            expectedVersion: null,
            userSessionId: 'user-2',
            tenantSessionId: 'tenant-1',
        ));
    }

    public function testItFailsWhenRequiredFieldIsMissing(): void
    {
        $this->expectException(ModelValidationException::class);

        ($this->handler)(new WriteModelCommand(
            entityAlias: 'product',
            data: ['name' => 'Only the name'],
            id: null,
            expectedVersion: null,
            userSessionId: 'user-1',
            tenantSessionId: 'tenant-1',
        ));
    }

    public function testItRejectsUnknownFields(): void
    {
        $this->expectException(ModelValidationException::class);

        ($this->handler)(new WriteModelCommand(
            entityAlias: 'product',
            data: ['name' => 'Valid name', 'status' => 'draft', 'secret' => 'x'],
            id: null,
            expectedVersion: null,
            userSessionId: 'user-1',
            tenantSessionId: 'tenant-1',
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

        $this->repository->save(entity: $product, expectedVersion: null);

        return $product;
    }
}
