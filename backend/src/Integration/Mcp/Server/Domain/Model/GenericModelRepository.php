<?php

namespace Integration\Mcp\Server\Domain\Model;

interface GenericModelRepository
{
    public function nextId(): string;

    public function find(string $class, string $id): ?object;

    /**
     * @return object[]
     */
    public function findBy(string $class, string $field, string $value): array;

    public function reference(string $class, string $id): object;

    public function save(object $entity): void;

    /**
     * @param object[] $entities
     */
    public function deleteAll(array $entities): void;
}
