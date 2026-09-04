<?php

namespace Economy\Finance\Budget\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Economy\Finance\Budget\Domain\Model\FinanceBudget;
use Economy\Finance\Budget\Domain\Model\FinanceBudgetCategory;
use Economy\Finance\Budget\Domain\Model\FinanceBudgetRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineFinanceBudgetRepository extends EntityRepository implements FinanceBudgetRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?FinanceBudget
    {
        $budget = $this->getEntityManager()->createQueryBuilder()
            ->select('financeBudget')
            ->from(from: FinanceBudget::class, alias: 'financeBudget')
            ->where('financeBudget.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();

        return $this->hydrateCategories(financeBudget: $budget);
    }

    public function findCurrent(): ?FinanceBudget
    {
        $budget = $this->getEntityManager()->createQueryBuilder()
            ->select('financeBudget')
            ->from(from: FinanceBudget::class, alias: 'financeBudget')
            ->orderBy('financeBudget.createdAt', 'ASC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        return $this->hydrateCategories(financeBudget: $budget);
    }

    /**
     * Reconciles the categories by id: a command that does not rebuild them keeps the ones it loaded,
     * so wiping them all would drop the categories of every caller that only touches the budget itself.
     */
    public function save(FinanceBudget $financeBudget): void
    {
        $entityManager = $this->getEntityManager();

        $this->removeChildren(
            budgetId: $financeBudget->id,
            keptCategoryIds: array_map(
                callback: static fn (FinanceBudgetCategory $category): string => $category->id,
                array: $financeBudget->categories,
            ),
        );
        $entityManager->persist(object: $financeBudget);

        foreach ($financeBudget->categories as $category) {
            $entityManager->persist(object: $category);
        }
    }

    public function delete(FinanceBudget $financeBudget): void
    {
        $this->removeChildren(budgetId: $financeBudget->id, keptCategoryIds: []);
        $this->getEntityManager()->remove(object: $financeBudget);
    }

    private function hydrateCategories(?FinanceBudget $financeBudget): ?FinanceBudget
    {
        if (null === $financeBudget) {
            return null;
        }

        $financeBudget->categories = $this->getEntityManager()->createQueryBuilder()
            ->select('financeBudgetCategory')
            ->from(from: FinanceBudgetCategory::class, alias: 'financeBudgetCategory')
            ->where('financeBudgetCategory.budgetId = :budgetId')
            ->setParameter(key: 'budgetId', value: $financeBudget->id)
            ->orderBy('financeBudgetCategory.position', 'ASC')
            ->getQuery()
            ->getResult();

        return $financeBudget;
    }

    /**
     * @param array<int, string> $keptCategoryIds
     */
    private function removeChildren(string $budgetId, array $keptCategoryIds): void
    {
        $queryBuilder = $this->getEntityManager()->createQueryBuilder()
            ->delete(delete: FinanceBudgetCategory::class, alias: 'financeBudgetCategory')
            ->where('financeBudgetCategory.budgetId = :budgetId')
            ->setParameter(key: 'budgetId', value: $budgetId);

        if ([] !== $keptCategoryIds) {
            $queryBuilder->andWhere('financeBudgetCategory.id NOT IN (:keptCategoryIds)')
                ->setParameter(key: 'keptCategoryIds', value: $keptCategoryIds);
        }

        $queryBuilder->getQuery()->execute();
    }
}
