<?php

namespace Mcp\Server\Mcp\Domain\Service;

use Mcp\Server\Mcp\Domain\Model\GenericModelRepository;
use Mcp\Server\Mcp\Domain\QueryModel\Dto\ModelDescriptor;

final readonly class ModelHydrator
{
    public function __construct(
        private GenericModelRepository $repository,
    ) {
    }

    /**
     * @return string[]
     */
    public function hydrate(
        object $entity,
        ModelDescriptor $descriptor,
        array $data,
        bool $isCreate,
        string $userSessionId,
        \DateTime $now,
    ): array {
        $changedFields = [];

        foreach ($descriptor->fields as $field) {
            if (!$field->writable || !array_key_exists($field->name, $data)) {
                continue;
            }

            $entity->{$field->name} = $data[$field->name];
            $changedFields[] = $field->name;
        }

        foreach ($descriptor->relations as $relation) {
            if (!$relation->writable || !array_key_exists($relation->name, $data)) {
                continue;
            }

            $targetId = $data[$relation->name];
            $entity->{$relation->name} = null === $targetId
                ? null
                : $this->repository->reference(class: $relation->targetClass, id: $targetId);
            $changedFields[] = $relation->name;
        }

        $entity->updatedAt = $now;
        $entity->updatedByUserId = $userSessionId;

        if ($isCreate) {
            $entity->createdAt = $now;
            $entity->createdByUserId = $userSessionId;
        }

        return $changedFields;
    }
}
