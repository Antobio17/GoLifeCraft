<?php

namespace App\Tests\Integration\Mcp\Server\Application\Command;

use App\Tests\Integration\Mcp\Server\Support\FakeChildModel;
use App\Tests\Integration\Mcp\Server\Support\FakeModel;
use App\Tests\Integration\Mcp\Server\Support\FakeModelMetadata;
use Integration\Mcp\Server\Application\Command\DeleteModelCommand;
use Integration\Mcp\Server\Application\Command\DeleteModelCommandHandler;
use Integration\Mcp\Server\Domain\Event\ModelDeleted;
use Integration\Mcp\Server\Domain\Exception\DeleteModelException;
use Integration\Mcp\Server\Domain\Exception\ModelNotExposedException;
use Integration\Mcp\Server\Domain\Service\GenericModelHydrator;
use Integration\Mcp\Server\Domain\Service\ModelPermissionChecker;
use Integration\Mcp\Server\Infrastructure\Domain\Model\InMemory\InMemoryGenericModelRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteModelCommandHandlerTest extends TestCase
{
    private InMemoryGenericModelRepository $repository;
    private DomainEventCollectorService $domainEventCollectorService;
    private DeleteModelCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryGenericModelRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();

        $this->handler = new DeleteModelCommandHandler(
            metadataProvider: new FakeModelMetadata(),
            permissionChecker: new ModelPermissionChecker(),
            hydrator: new GenericModelHydrator(repository: $this->repository),
            repository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItDeletesAModel(): void
    {
        $this->seedFakeModel(id: 'product-1');

        ($this->handler)(new DeleteModelCommand(
            entityAlias: 'fake_model',
            id: 'product-1',
            userSessionId: 'user-1',
            role: 'ROLE_GOD',
        ));

        self::assertSame([], $this->repository->saved);

        $events = $this->domainEventCollectorService->pullEvents();
        self::assertCount(1, $events);
        self::assertInstanceOf(ModelDeleted::class, $events[0]);
        self::assertSame('fake_model', $events[0]->entityAlias);
        self::assertSame('product-1', $events[0]->rootId);
        self::assertSame('user-1', $events[0]->deletedByUserId);
        self::assertSame('Barrita', $events[0]->entitySnapshot['name']);
        self::assertSame('draft', $events[0]->entitySnapshot['status']);
    }

    public function testItCascadesToChildrenBeforeTheParent(): void
    {
        $this->seedFakeModel(id: 'product-1');
        $this->seedFakeChildModel(id: 'child-1', parentId: 'product-1');
        $this->seedFakeChildModel(id: 'child-2', parentId: 'product-1');
        $this->seedFakeChildModel(id: 'child-3', parentId: 'product-2');

        ($this->handler)(new DeleteModelCommand(
            entityAlias: 'fake_model',
            id: 'product-1',
            userSessionId: 'user-1',
            role: 'ROLE_GOD',
        ));

        self::assertSame(['child-3'], array_keys($this->repository->saved));

        $events = $this->domainEventCollectorService->pullEvents();
        self::assertCount(3, $events);
        self::assertSame(['child-1', 'child-2', 'product-1'], array_map(
            static fn (ModelDeleted $event): string => $event->aggregateId,
            $events,
        ));
        self::assertSame('fake_child', $events[0]->entityAlias);
        self::assertSame('product-1', $events[0]->rootId);
    }

    public function testItFailsWhenTheRecordDoesNotExist(): void
    {
        $this->expectException(DeleteModelException::class);

        ($this->handler)(new DeleteModelCommand(
            entityAlias: 'fake_model',
            id: 'missing-product',
            userSessionId: 'user-1',
            role: 'ROLE_GOD',
        ));
    }

    public function testItRejectsDeleteForUnauthorizedRole(): void
    {
        $this->seedFakeModel(id: 'product-1');

        $this->expectException(ModelNotExposedException::class);

        ($this->handler)(new DeleteModelCommand(
            entityAlias: 'fake_model',
            id: 'product-1',
            userSessionId: 'user-1',
            role: 'ROLE_UNAUTHORIZED',
        ));
    }

    public function testItRejectsUnknownAliases(): void
    {
        $this->expectException(ModelNotExposedException::class);

        ($this->handler)(new DeleteModelCommand(
            entityAlias: 'unknown_model',
            id: 'product-1',
            userSessionId: 'user-1',
            role: 'ROLE_GOD',
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

    private function seedFakeChildModel(string $id, string $parentId): FakeChildModel
    {
        $child = new FakeChildModel();
        $child->id = $id;
        $child->parentId = $parentId;
        $child->label = 'Child of '.$parentId;
        $child->createdAt = new \DateTime();
        $child->updatedAt = new \DateTime();
        $child->createdByUserId = 'user-1';
        $child->updatedByUserId = 'user-1';

        $this->repository->save(entity: $child);

        return $child;
    }
}
