<?php

namespace Integration\Mcp\Server\Application\Command;

use Integration\Mcp\Server\Domain\Event\ModelWritten;
use Integration\Mcp\Server\Domain\Exception\ModelNotExposedException;
use Integration\Mcp\Server\Domain\Exception\WriteModelException;
use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Integration\Mcp\Server\Domain\Model\GenericModelRepository;
use Integration\Mcp\Server\Domain\QueryModel\Dto\ModelDescriptor;
use Integration\Mcp\Server\Domain\Service\GenericModelHydrator;
use Integration\Mcp\Server\Domain\Service\ModelMetadataProvider;
use Integration\Mcp\Server\Domain\Service\ModelPermissionChecker;
use Integration\Mcp\Server\Domain\Service\ModelValidator;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class WriteModelCommandHandler
{
    public function __construct(
        private ModelMetadataProvider $metadataProvider,
        private ModelPermissionChecker $permissionChecker,
        private ModelValidator $validator,
        private GenericModelHydrator $hydrator,
        private GenericModelRepository $repository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(WriteModelCommand $command): void
    {
        $descriptor = $this->metadataProvider->describe(alias: $command->entityAlias);

        if (!$this->permissionChecker->canWrite(role: $command->role, descriptor: $descriptor)) {
            throw ModelNotExposedException::alias(alias: $command->entityAlias);
        }

        $isCreate = null === $command->id;

        $this->validator->validate(
            descriptor: $descriptor,
            data: $command->data,
            isCreate: $isCreate,
            currentId: $command->id,
        );

        $entity = $isCreate
            ? $this->createEntity(descriptor: $descriptor)
            : $this->loadEntity(descriptor: $descriptor, command: $command);

        $this->hydrator->hydrate(entity: $entity, descriptor: $descriptor, data: $command->data);

        $now = $this->dateTimeGenerator->now();
        $isCreate
            ? $entity->stampCreation(userId: $command->userSessionId, now: $now)
            : $entity->stampUpdate(userId: $command->userSessionId, now: $now);

        $entity->record(event: new ModelWritten(
            aggregateId: $entity->id,
            occurredOn: $now,
            entityAlias: $command->entityAlias,
            operation: $isCreate ? 'created' : 'updated',
            entitySnapshot: $this->hydrator->snapshot(entity: $entity, descriptor: $descriptor),
        ));

        $this->repository->save(entity: $entity);
        $this->domainEventCollectorService->register(aggregate: $entity);
    }

    private function createEntity(ModelDescriptor $descriptor): GenericAggregate
    {
        $class = $descriptor->class;
        $entity = new $class();
        $entity->id = $this->repository->nextId();

        return $entity;
    }

    private function loadEntity(ModelDescriptor $descriptor, WriteModelCommand $command): GenericAggregate
    {
        $entity = $this->repository->find(class: $descriptor->class, id: $command->id);

        if (null === $entity) {
            throw WriteModelException::notFound(alias: $command->entityAlias, id: $command->id);
        }

        return $entity;
    }
}
