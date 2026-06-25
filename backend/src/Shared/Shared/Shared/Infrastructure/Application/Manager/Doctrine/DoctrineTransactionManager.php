<?php

namespace Shared\Shared\Shared\Infrastructure\Application\Manager\Doctrine;

use Doctrine\ORM\EntityManager;
use Shared\Shared\Shared\Application\Manager\TransactionManager;

final class DoctrineTransactionManager implements TransactionManager
{
    public function __construct(
        private readonly EntityManager $masterEntityManager,
        private readonly EntityManager $tenantEntityManager,
        private bool $isTransactionActive = false,
    ) {
    }

    public function isTransactionActive(): bool
    {
        return $this->isTransactionActive;
    }

    public function beginTransaction(): void
    {
        if ($this->isTransactionActive) {
            return;
        }

        $this->masterEntityManager->beginTransaction();
        $this->tenantEntityManager->beginTransaction();
        $this->isTransactionActive = true;
    }

    public function flush(): void
    {
        if (!$this->isTransactionActive) {
            return;
        }

        $this->masterEntityManager->flush();
        $this->masterEntityManager->commit();
        $this->tenantEntityManager->flush();
        $this->tenantEntityManager->commit();
        $this->isTransactionActive = false;
    }

    public function rollback(): void
    {
        if (!$this->isTransactionActive) {
            return;
        }

        $this->masterEntityManager->rollback();
        $this->tenantEntityManager->rollback();
        $this->isTransactionActive = false;
    }
}
