<?php

namespace Integration\Mcp\Server\Domain\Service;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Integration\Mcp\Server\Domain\Model\GenericModelRepository;
use Integration\Mcp\Server\Domain\QueryModel\Dto\ModelDescriptor;

final readonly class GenericModelHydrator
{
    public function __construct(
        private GenericModelRepository $repository,
    ) {
    }

    public function hydrate(GenericAggregate $entity, ModelDescriptor $descriptor, array $data): void
    {
        $this->writeFields(entity: $entity, descriptor: $descriptor, data: $data);
        $this->writeRelations(entity: $entity, descriptor: $descriptor, data: $data);
    }

    public function snapshot(GenericAggregate $entity, ModelDescriptor $descriptor): array
    {
        $snapshot = [
            'id' => $entity->id,
            'createdAt' => $entity->createdAt->format(\DateTimeInterface::ATOM),
            'updatedAt' => $entity->updatedAt->format(\DateTimeInterface::ATOM),
            'createdByUserId' => $entity->createdByUserId,
            'updatedByUserId' => $entity->updatedByUserId,
        ];

        foreach ($descriptor->fields as $field) {
            $snapshot[$field->name] = $this->normalize(value: $entity->{$field->name} ?? null);
        }

        foreach ($descriptor->relations as $relation) {
            $related = $entity->{$relation->name} ?? null;
            $snapshot[$relation->name] = $related?->id;
        }

        return $snapshot;
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

    private function normalize(mixed $value): mixed
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->format(\DateTimeInterface::ATOM);
        }

        return $value;
    }
}
