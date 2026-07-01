<?php

namespace Integration\Mcp\Server\Domain\Model;

interface GenericModelRepository
{
    public function nextId(): string;

    public function find(string $class, string $id): ?object;

    public function reference(string $class, string $id): object;

    public function save(object $entity): void;
}
