<?php

namespace Shared\Shared\Shared\Application\Manager;

interface TransactionManager
{
    public function isTransactionActive(): bool;

    public function beginTransaction(): void;

    public function flush(): void;

    public function rollback(): void;
}
