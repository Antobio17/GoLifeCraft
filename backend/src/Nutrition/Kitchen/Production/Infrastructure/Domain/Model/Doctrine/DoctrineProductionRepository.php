<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Domain\Model\ProductionRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineProductionRepository extends EntityRepository implements ProductionRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    /**
     * The items are loaded and attached here because cooking one of them mutates a child: the
     * aggregate has to arrive whole for its own rules to hold.
     */
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
        }
    }

    public function delete(Production $production): void
    {
        $entityManager = $this->getEntityManager();

        foreach ($this->itemsOf(productionId: $production->id) as $item) {
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

        return $this->withChecklist(items: $items);
    }

    /**
     * Rows written before the checklist column existed hold a JSON null, and Doctrine leaves a
     * typed property uninitialised rather than assigning null to it. An empty checklist is what
     * those rows mean, so that is what the aggregate gets.
     *
     * @param ProductionItem[] $items
     *
     * @return ProductionItem[]
     */
    private function withChecklist(array $items): array
    {
        foreach ($items as $item) {
            if (isset($item->checkedArticleIds)) {
                continue;
            }

            $item->checkedArticleIds = [];
        }

        return $items;
    }
}
