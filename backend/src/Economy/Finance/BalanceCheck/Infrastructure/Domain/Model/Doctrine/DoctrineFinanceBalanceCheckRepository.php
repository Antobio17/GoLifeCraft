<?php

namespace Economy\Finance\BalanceCheck\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Economy\Finance\BalanceCheck\Domain\Model\FinanceBalanceCheck;
use Economy\Finance\BalanceCheck\Domain\Model\FinanceBalanceCheckRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineFinanceBalanceCheckRepository extends EntityRepository implements FinanceBalanceCheckRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?FinanceBalanceCheck
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('financeBalanceCheck')
            ->from(from: FinanceBalanceCheck::class, alias: 'financeBalanceCheck')
            ->where('financeBalanceCheck.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findByAccountId(string $accountId): array
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('financeBalanceCheck')
            ->from(from: FinanceBalanceCheck::class, alias: 'financeBalanceCheck')
            ->where('financeBalanceCheck.accountId = :accountId')
            ->setParameter(key: 'accountId', value: $accountId)
            ->getQuery()
            ->getResult();
    }

    public function save(FinanceBalanceCheck $financeBalanceCheck): void
    {
        $this->getEntityManager()->persist(object: $financeBalanceCheck);
    }

    public function delete(FinanceBalanceCheck $financeBalanceCheck): void
    {
        $this->getEntityManager()->remove(object: $financeBalanceCheck);
    }
}
