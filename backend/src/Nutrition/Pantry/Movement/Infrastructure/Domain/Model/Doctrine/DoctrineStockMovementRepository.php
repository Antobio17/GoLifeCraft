<?php

namespace Nutrition\Pantry\Movement\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Domain\Model\StockMovementRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineStockMovementRepository extends EntityRepository implements StockMovementRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findBySource(string $kind, string $refId, string $sourceKind, string $sourceId): ?StockMovement
    {
        return $this->findOneBy([
            'kind' => $kind,
            'refId' => $refId,
            'sourceKind' => $sourceKind,
            'sourceId' => $sourceId,
        ]);
    }

    public function findAllBySource(string $sourceKind, string $sourceId): array
    {
        return $this->findBy(['sourceKind' => $sourceKind, 'sourceId' => $sourceId]);
    }

    public function findAllByReference(string $kind, string $refId): array
    {
        return $this->findBy(['kind' => $kind, 'refId' => $refId]);
    }

    public function save(StockMovement $stockMovement): void
    {
        $this->getEntityManager()->persist(object: $stockMovement);
    }

    public function delete(StockMovement $stockMovement): void
    {
        $this->getEntityManager()->remove(object: $stockMovement);
    }
}
