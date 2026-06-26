<?php

namespace Mcp\Server\Mcp\Infrastructure\Domain\Model\Doctrine;

use Doctrine\DBAL\LockMode;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\OptimisticLockException;
use Mcp\Server\Mcp\Domain\Exception\WriteModelException;
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

    public function save(object $entity, ?int $expectedVersion): void
    {
        $this->entityManager->persist(object: $entity);

        try {
            if (null !== $expectedVersion) {
                $this->entityManager->lock(entity: $entity, lockMode: LockMode::OPTIMISTIC, lockVersion: $expectedVersion);
            }

            $this->entityManager->flush();
        } catch (OptimisticLockException) {
            throw WriteModelException::versionConflict(id: $entity->id, expectedVersion: $expectedVersion);
        }
    }
}
