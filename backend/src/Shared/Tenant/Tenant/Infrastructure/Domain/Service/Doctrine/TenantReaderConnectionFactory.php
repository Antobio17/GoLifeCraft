<?php

namespace Shared\Tenant\Tenant\Infrastructure\Domain\Service\Doctrine;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;

final readonly class TenantReaderConnectionFactory
{
    private const string TENANT_ID_PATTERN = '/^[A-Za-z0-9_]+$/';

    public function __construct(
        private string $readerHost,
        private string $port,
        private string $serverUsername,
        private string $serverPassword,
    ) {
    }

    public function connect(string $tenantId): ?Connection
    {
        if (1 !== preg_match(pattern: self::TENANT_ID_PATTERN, subject: $tenantId)) {
            return null;
        }

        if (!$this->schemaExists(tenantId: $tenantId)) {
            return null;
        }

        return DriverManager::getConnection(params: $this->params(dbname: $tenantId));
    }

    private function schemaExists(string $tenantId): bool
    {
        $serverConnection = DriverManager::getConnection(params: $this->params(dbname: null));

        try {
            return false !== $serverConnection
                ->executeQuery(
                    sql: 'SELECT schema_name FROM information_schema.schemata WHERE schema_name = ?',
                    params: [$tenantId],
                )
                ->fetchOne();
        } finally {
            $serverConnection->close();
        }
    }

    /**
     * @return array<string, string>
     */
    private function params(?string $dbname): array
    {
        $params = [
            'driver' => 'pdo_mysql',
            'host' => $this->readerHost,
            'port' => $this->port,
            'user' => $this->serverUsername,
            'password' => $this->serverPassword,
            'charset' => 'utf8mb4',
        ];

        if (null === $dbname) {
            return $params;
        }

        return array_merge($params, ['dbname' => $dbname]);
    }
}
