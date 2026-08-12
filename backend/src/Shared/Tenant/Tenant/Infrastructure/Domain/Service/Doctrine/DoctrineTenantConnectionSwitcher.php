<?php

namespace Shared\Tenant\Tenant\Infrastructure\Domain\Service\Doctrine;

use Doctrine\DBAL\Connection;
use Shared\Tenant\Tenant\Domain\Service\TenantConnectionSwitcher;
use Shared\Tenant\Tenant\Domain\Service\TenantContext;

final readonly class DoctrineTenantConnectionSwitcher implements TenantConnectionSwitcher
{
    public function __construct(
        private Connection $writerTenantConnection,
        private Connection $readerTenantConnection,
        private string $writerHost,
        private string $readerHost,
        private string $port,
        private string $serverUsername,
        private string $serverPassword,
        private TenantContext $tenantContext,
    ) {
    }

    public function switch(string $tenantId): void
    {
        $this->tenantContext->set(tenantId: $tenantId);

        $this->change(
            connection: $this->writerTenantConnection,
            ip: $this->writerHost,
            port: $this->port,
            dbname: $tenantId,
            username: $this->serverUsername,
            password: $this->serverPassword
        );

        $this->change(
            connection: $this->readerTenantConnection,
            ip: $this->readerHost,
            port: $this->port,
            dbname: $tenantId,
            username: $this->serverUsername,
            password: $this->serverPassword
        );
    }

    private function change(
        Connection $connection,
        string $ip,
        string $port,
        string $dbname,
        string $username,
        string $password,
    ): void {
        $connectionParams = array_merge($connection->getParams(), [
            'driver' => 'pdo_mysql',
            'dbname' => $dbname,
            'user' => $username,
            'password' => $password,
            'host' => $ip,
            'port' => $port,
            'charset' => 'utf8mb4',
            'defaultTableOptions' => TenantTableOptions::DEFAULTS,
        ]);

        if ($connection->isConnected()) {
            $connection->close();
        }

        $connection->__construct(
            params: $connectionParams,
            driver: $connection->getDriver(),
            config: $connection->getConfiguration(),
        );
    }
}
