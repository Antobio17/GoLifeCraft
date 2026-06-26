<?php

namespace Mcp\Server\Mcp\Application\Command;

use Mcp\Server\Mcp\Domain\Event\ModelWritten;
use Mcp\Server\Mcp\Domain\Exception\WriteModelException;
use Mcp\Server\Mcp\Domain\Model\GenericAggregate;
use Mcp\Server\Mcp\Domain\Model\GenericModelRepository;
use Mcp\Server\Mcp\Domain\QueryModel\Dto\ModelDescriptor;
use Mcp\Server\Mcp\Domain\Service\ModelHydrator;
use Mcp\Server\Mcp\Domain\Service\ModelMetadataProvider;
use Mcp\Server\Mcp\Domain\Service\ModelValidator;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class WriteModelCommandHandler
{
    public function __construct(
        private ModelMetadataProvider $metadataProvider,
        private ModelValidator $validator,
        private ModelHydrator $hydrator,
        private GenericModelRepository $repository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(WriteModelCommand $command): array
    {
        $descriptor = $this->metadataProvider->describe(alias: $command->entityAlias);
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

        $now = $this->dateTimeGenerator->now();

        $changedFields = $this->hydrator->hydrate(
            entity: $entity,
            descriptor: $descriptor,
            data: $command->data,
            isCreate: $isCreate,
            userSessionId: $command->userSessionId,
            now: $now,
        );

        $entity->record(event: new ModelWritten(
            aggregateId: $entity->id,
            occurredOn: $now,
            entityAlias: $command->entityAlias,
            operation: $isCreate ? 'created' : 'updated',
            changedFields: $changedFields,
        ));

        $this->repository->save(entity: $entity, expectedVersion: $command->expectedVersion);
        $this->domainEventCollectorService->register(aggregate: $entity);

        return [
            'id' => $entity->id,
            'version' => $entity->aggregateVersion(),
            'operation' => $isCreate ? 'created' : 'updated',
        ];
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
        if (null === $command->expectedVersion) {
            throw WriteModelException::versionRequired();
        }

        $entity = $this->repository->find(class: $descriptor->class, id: $command->id);

        if (null === $entity) {
            throw WriteModelException::notFound(alias: $command->entityAlias, id: $command->id);
        }

        return $entity;
    }
}
