<?php

namespace Economy\Finance\Recurrence\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Economy\Finance\Recurrence\Domain\Model\FinanceRecurrence;
use Economy\Finance\Recurrence\Domain\Model\FinanceRecurrenceRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineFinanceRecurrenceRepository extends EntityRepository implements FinanceRecurrenceRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?FinanceRecurrence
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('financeRecurrence')
            ->from(from: FinanceRecurrence::class, alias: 'financeRecurrence')
            ->where('financeRecurrence.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(FinanceRecurrence $financeRecurrence): void
    {
        $this->getEntityManager()->persist(object: $financeRecurrence);
    }

    public function delete(FinanceRecurrence $financeRecurrence): void
    {
        $this->getEntityManager()->remove(object: $financeRecurrence);
    }
}
