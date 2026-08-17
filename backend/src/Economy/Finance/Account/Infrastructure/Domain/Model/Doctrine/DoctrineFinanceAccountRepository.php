<?php

namespace Economy\Finance\Account\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Economy\Finance\Account\Domain\Model\FinanceAccount;
use Economy\Finance\Account\Domain\Model\FinanceAccountRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineFinanceAccountRepository extends EntityRepository implements FinanceAccountRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?FinanceAccount
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('financeAccount')
            ->from(from: FinanceAccount::class, alias: 'financeAccount')
            ->where('financeAccount.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(FinanceAccount $financeAccount): void
    {
        $this->getEntityManager()->persist(object: $financeAccount);
    }

    public function delete(FinanceAccount $financeAccount): void
    {
        $this->getEntityManager()->remove(object: $financeAccount);
    }
}
