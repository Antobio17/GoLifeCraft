<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItemConsumption;
use Nutrition\Kitchen\Production\Domain\Model\ProductionRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineProductionRepository extends EntityRepository implements ProductionRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?Production
    {
        $production = $this->find($id);

        if (null === $production) {
            return null;
        }

        $production->items = $this->itemsOf(productionId: $id);

        return $production;
    }

    public function save(Production $production): void
    {
        $entityManager = $this->getEntityManager();

        $entityManager->persist(object: $production);

        foreach ($production->items as $item) {
            $entityManager->persist(object: $item);

            foreach ($item->consumptions as $consumption) {
                $entityManager->persist(object: $consumption);
            }

            $this->releaseConsumptions(item: $item);
        }
    }

    public function delete(Production $production): void
    {
        $entityManager = $this->getEntityManager();

        foreach ($production->items as $item) {
            $this->removeConsumptionsOf(productionItemId: $item->id);
            $entityManager->remove(object: $item);
        }

        $entityManager->remove(object: $production);
    }

    /**
     * @return ProductionItem[]
     */
    private function itemsOf(string $productionId): array
    {
        $items = $this->getEntityManager()->createQueryBuilder()
            ->select('item')
            ->from(from: ProductionItem::class, alias: 'item')
            ->where('item.productionId = :productionId')
            ->orderBy('item.position', 'ASC')
            ->setParameter(key: 'productionId', value: $productionId)
            ->getQuery()
            ->getResult();

        return $this->withConsumptions(items: $items);
    }

    /**
     * @param ProductionItem[] $items
     *
     * @return ProductionItem[]
     */
    private function withConsumptions(array $items): array
    {
        if ([] === $items) {
            return $items;
        }

        $consumptions = $this->getEntityManager()->createQueryBuilder()
            ->select('consumption')
            ->from(from: ProductionItemConsumption::class, alias: 'consumption')
            ->where('consumption.productionItemId IN (:productionItemIds)')
            ->setParameter(key: 'productionItemIds', value: array_map(
                callback: static fn (ProductionItem $item): string => $item->id,
                array: $items,
            ))
            ->getQuery()
            ->getResult();

        $byItem = [];

        foreach ($consumptions as $consumption) {
            $byItem[$consumption->productionItemId][] = $consumption;
        }

        foreach ($items as $item) {
            $item->consumptions = $byItem[$item->id] ?? [];
        }

        return $items;
    }

    private function releaseConsumptions(ProductionItem $item): void
    {
        if ([] === $item->releasedConsumptionIds) {
            return;
        }

        $this->getEntityManager()->createQueryBuilder()
            ->delete(delete: ProductionItemConsumption::class, alias: 'consumption')
            ->where('consumption.id IN (:consumptionIds)')
            ->setParameter(key: 'consumptionIds', value: $item->releasedConsumptionIds)
            ->getQuery()
            ->execute();

        $item->releasedConsumptionIds = [];
    }

    private function removeConsumptionsOf(string $productionItemId): void
    {
        $this->getEntityManager()->createQueryBuilder()
            ->delete(delete: ProductionItemConsumption::class, alias: 'consumption')
            ->where('consumption.productionItemId = :productionItemId')
            ->setParameter(key: 'productionItemId', value: $productionItemId)
            ->getQuery()
            ->execute();
    }
}
