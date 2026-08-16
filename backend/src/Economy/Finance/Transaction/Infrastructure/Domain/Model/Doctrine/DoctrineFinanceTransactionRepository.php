<?php

namespace Economy\Finance\Transaction\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use Economy\Finance\Transaction\Domain\Model\FinanceTransactionRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineFinanceTransactionRepository extends EntityRepository implements FinanceTransactionRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?FinanceTransaction
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('financeTransaction')
            ->from(from: FinanceTransaction::class, alias: 'financeTransaction')
            ->where('financeTransaction.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(FinanceTransaction $financeTransaction): void
    {
        $this->getEntityManager()->persist(object: $financeTransaction);
    }

    public function delete(FinanceTransaction $financeTransaction): void
    {
        $this->getEntityManager()->remove(object: $financeTransaction);
    }
}
