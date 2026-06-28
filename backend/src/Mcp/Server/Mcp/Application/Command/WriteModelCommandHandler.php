<?php

namespace Mcp\Server\Mcp\Application\Command;

use Mcp\Server\Mcp\Domain\Event\ModelWritten;
use Mcp\Server\Mcp\Domain\Exception\WriteModelException;
use Mcp\Server\Mcp\Domain\Model\GenericAggregate;
use Mcp\Server\Mcp\Domain\Model\GenericModelRepository;
use Mcp\Server\Mcp\Domain\QueryModel\Dto\ModelDescriptor;
use Mcp\Server\Mcp\Domain\Service\ModelMetadataProvider;
use Mcp\Server\Mcp\Domain\Service\ModelValidator;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class WriteModelCommandHandler
{
    public function __construct(
        private ModelMetadataProvider $metadataProvider,
        private ModelValidator $validator,
        private GenericModelRepository $repository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(WriteModelCommand $command): void
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

        $this->writeFields(entity: $entity, descriptor: $descriptor, data: $command->data);
        $this->writeRelations(entity: $entity, descriptor: $descriptor, data: $command->data);

        $entity->updatedAt = $now;
        $entity->updatedByUserId = $command->userSessionId;

        if ($isCreate) {
            $entity->createdAt = $now;
            $entity->createdByUserId = $command->userSessionId;
        }

        $entity->record(event: new ModelWritten(
            aggregateId: $entity->id,
            occurredOn: $now,
            entityAlias: $command->entityAlias,
            operation: $isCreate ? 'created' : 'updated',
            entitySnapshot: $this->buildSnapshot(entity: $entity, descriptor: $descriptor),
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

    private function writeFields(GenericAggregate $entity, ModelDescriptor $descriptor, array $data): void
    {
        foreach ($descriptor->fields as $field) {
            if (!$field->writable || !array_key_exists($field->name, $data)) {
                continue;
            }

            $entity->{$field->name} = $data[$field->name];
        }
    }

    private function writeRelations(GenericAggregate $entity, ModelDescriptor $descriptor, array $data): void
    {
        foreach ($descriptor->relations as $relation) {
            if (!$relation->writable || !array_key_exists($relation->name, $data)) {
                continue;
            }

            $targetId = $data[$relation->name];
            $entity->{$relation->name} = null === $targetId
                ? null
                : $this->repository->reference(class: $relation->targetClass, id: $targetId);
        }
    }

    private function buildSnapshot(GenericAggregate $entity, ModelDescriptor $descriptor): array
    {
        $snapshot = [
            'id' => $entity->id,
            'createdAt' => $entity->createdAt->format(\DateTimeInterface::ATOM),
            'updatedAt' => $entity->updatedAt->format(\DateTimeInterface::ATOM),
            'createdByUserId' => $entity->createdByUserId,
            'updatedByUserId' => $entity->updatedByUserId,
        ];

        foreach ($descriptor->fields as $field) {
            $snapshot[$field->name] = $entity->{$field->name} ?? null;
        }

        foreach ($descriptor->relations as $relation) {
            $related = $entity->{$relation->name} ?? null;
            $snapshot[$relation->name] = null === $related ? null : $related->id;
        }

        return $snapshot;
    }
}
