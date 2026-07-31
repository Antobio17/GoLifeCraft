<?php

namespace Integration\Mcp\Server\Infrastructure\Domain\Model\InMemory;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Integration\Mcp\Server\Domain\Model\GenericModelRepository;
use Ramsey\Uuid\Uuid;

final class InMemoryGenericModelRepository implements GenericModelRepository
{
    /** @var array<string, object> */
    public array $saved = [];

    /** @var array<string, int> */
    private array $versions = [];

    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function find(string $class, string $id): ?object
    {
        return $this->saved[$id] ?? null;
    }

    public function findBy(string $class, string $field, string $value): array
    {
        return array_values(array_filter(
            $this->saved,
            static fn (object $entity): bool => $entity instanceof $class && ($entity->{$field} ?? null) === $value,
        ));
    }

    public function reference(string $class, string $id): object
    {
        $entity = (new \ReflectionClass($class))->newInstanceWithoutConstructor();
        $entity->id = $id;

        return $entity;
    }

    public function save(object $entity): void
    {
        $current = $this->versions[$entity->id] ?? 0;
        $newVersion = $current + 1;

        $this->setVersion(entity: $entity, version: $newVersion);

        $this->versions[$entity->id] = $newVersion;
        $this->saved[$entity->id] = $entity;
    }

    public function deleteAll(array $entities): void
    {
        foreach ($entities as $entity) {
            unset($this->saved[$entity->id], $this->versions[$entity->id]);
        }
    }

    private function setVersion(object $entity, int $version): void
    {
        \Closure::bind(function (int $value): void {
            $this->version = $value;
        }, $entity, GenericAggregate::class)($version);
    }
}
