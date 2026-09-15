<?php

namespace Shared\Shared\Shared\Infrastructure\Application\Manager\Doctrine;

use Doctrine\ORM\EntityManager;
use Shared\Shared\Shared\Application\Manager\TransactionManager;

final class DoctrineTransactionManager implements TransactionManager
{
    private int $depth = 0;

    public function __construct(
        private readonly EntityManager $masterEntityManager,
        private readonly EntityManager $tenantEntityManager,
    ) {
    }

    public function isTransactionActive(): bool
    {
        return 0 < $this->depth;
    }

    public function beginTransaction(): void
    {
        ++$this->depth;

        if (1 < $this->depth) {
            return;
        }

        $this->masterEntityManager->beginTransaction();
        $this->tenantEntityManager->beginTransaction();
    }

    public function flushChanges(): void
    {
        if (0 === $this->depth) {
            return;
        }

        $this->masterEntityManager->flush();
        $this->tenantEntityManager->flush();
    }

    public function flush(): void
    {
        if (0 === $this->depth) {
            return;
        }

        --$this->depth;

        $this->masterEntityManager->flush();
        $this->tenantEntityManager->flush();

        if (0 < $this->depth) {
            return;
        }

        $this->masterEntityManager->commit();
        $this->tenantEntityManager->commit();
    }

    public function rollback(): void
    {
        if (0 === $this->depth) {
            return;
        }

        $this->depth = 0;
        $this->rollbackEntityManager(entityManager: $this->masterEntityManager);
        $this->rollbackEntityManager(entityManager: $this->tenantEntityManager);
    }

    private function rollbackEntityManager(EntityManager $entityManager): void
    {
        if (!$entityManager->getConnection()->isTransactionActive()) {
            return;
        }

        $entityManager->rollback();
    }
}
