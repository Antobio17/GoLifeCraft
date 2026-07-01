<?php

namespace App\Tests\Integration\Mcp\Server\Application\Command;

use App\Tests\Integration\Mcp\Server\Support\FakeModel;
use App\Tests\Integration\Mcp\Server\Support\FakeModelMetadata;
use Integration\Mcp\Server\Application\Command\WriteModelCommand;
use Integration\Mcp\Server\Application\Command\WriteModelCommandHandler;
use Integration\Mcp\Server\Domain\Event\ModelWritten;
use Integration\Mcp\Server\Domain\Exception\ModelNotExposedException;
use Integration\Mcp\Server\Domain\Exception\ModelValidationException;
use Integration\Mcp\Server\Domain\Service\GenericModelHydrator;
use Integration\Mcp\Server\Domain\Service\ModelPermissionChecker;
use Integration\Mcp\Server\Domain\Service\ModelValidator;
use Integration\Mcp\Server\Infrastructure\Domain\Model\InMemory\InMemoryGenericModelRepository;
use Integration\Mcp\Server\Infrastructure\Domain\QueryModel\InMemory\InMemoryWriteModelNeedleDataQuery;
use PHPUnit\Framework\TestCase;
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
            metadataProvider: new FakeModelMetadata(),
            permissionChecker: new ModelPermissionChecker(),
            validator: new ModelValidator(writeModelNeedleDataQuery: $this->writeModelNeedleDataQuery),
            hydrator: new GenericModelHydrator(repository: $this->repository),
            repository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesAModel(): void
    {
        ($this->handler)(new WriteModelCommand(
            entityAlias: 'fake_model',
            data: ['name' => 'Barrita proteica', 'status' => 'published', 'calories' => 240],
            id: null,
            userSessionId: 'user-1',
            role: 'ROLE_GOD',
        ));

        $products = $this->repository->saved;
        self::assertCount(1, $products);

        $product = array_values($products)[0];
        self::assertInstanceOf(FakeModel::class, $product);
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
        $product = $this->seedFakeModel(id: 'product-1');

        ($this->handler)(new WriteModelCommand(
            entityAlias: 'fake_model',
            data: ['name' => 'Barrita XL'],
            id: 'product-1',
            userSessionId: 'user-2',
            role: 'ROLE_GOD',
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
            entityAlias: 'fake_model',
            data: ['name' => 'Only the name'],
            id: null,
            userSessionId: 'user-1',
            role: 'ROLE_GOD',
        ));
    }

    public function testItRejectsUnknownFields(): void
    {
        $this->expectException(ModelValidationException::class);

        ($this->handler)(new WriteModelCommand(
            entityAlias: 'fake_model',
            data: ['name' => 'Valid name', 'status' => 'draft', 'secret' => 'x'],
            id: null,
            userSessionId: 'user-1',
            role: 'ROLE_GOD',
        ));
    }

    public function testItRejectsWriteForUnauthorizedRole(): void
    {
        $this->expectException(ModelNotExposedException::class);

        ($this->handler)(new WriteModelCommand(
            entityAlias: 'fake_model',
            data: ['name' => 'Barrita proteica', 'status' => 'published', 'calories' => 240],
            id: null,
            userSessionId: 'user-1',
            role: 'ROLE_CENTER_TECHNICAL',
        ));
    }

    private function seedFakeModel(string $id): FakeModel
    {
        $product = new FakeModel();
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
