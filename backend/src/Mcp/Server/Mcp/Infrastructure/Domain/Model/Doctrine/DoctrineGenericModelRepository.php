<?php

namespace Mcp\Server\Mcp\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityManagerInterface;
use Mcp\Server\Mcp\Domain\Model\GenericModelRepository;
use Ramsey\Uuid\Uuid;

final readonly class DoctrineGenericModelRepository implements GenericModelRepository
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {
    }

    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function find(string $class, string $id): ?object
    {
        return $this->entityManager->find(className: $class, id: $id);
    }

    public function reference(string $class, string $id): object
    {
        return $this->entityManager->getReference(entityName: $class, id: $id);
    }

    public function save(object $entity): void
    {
        $this->entityManager->persist(object: $entity);
        $this->entityManager->flush();
    }
}
