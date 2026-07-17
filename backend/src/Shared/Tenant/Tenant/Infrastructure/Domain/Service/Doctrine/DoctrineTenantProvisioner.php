<?php

namespace Shared\Tenant\Tenant\Infrastructure\Domain\Service\Doctrine;

use Doctrine\DBAL\DriverManager;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Shared\Tenant\Tenant\Domain\Exception\ProvisionTenantException;
use Shared\Tenant\Tenant\Domain\Service\TenantProvisioner;

final readonly class DoctrineTenantProvisioner implements TenantProvisioner
{
    public function __construct(
        private EntityManagerInterface $tenantEntityManager,
        private string $writerHost,
        private string $port,
        private string $serverUsername,
        private string $serverPassword,
    ) {
    }

    public function provision(string $tenantId): void
    {
        if (1 !== preg_match(pattern: '/^[A-Za-z0-9_]+$/', subject: $tenantId)) {
            throw ProvisionTenantException::invalidTenantId(tenantId: $tenantId);
        }

        $this->ensureDatabaseExists(tenantId: $tenantId);
        $this->ensureSchema(tenantId: $tenantId);
    }

    private function ensureDatabaseExists(string $tenantId): void
    {
        $serverConnection = DriverManager::getConnection(params: [
            'driver' => 'pdo_mysql',
            'host' => $this->writerHost,
            'port' => $this->port,
            'user' => $this->serverUsername,
            'password' => $this->serverPassword,
            'charset' => 'utf8mb4',
        ]);

        try {
            $serverConnection->executeStatement(sql: sprintf(
                'CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
                $tenantId,
            ));
        } finally {
            $serverConnection->close();
        }
    }

    private function ensureSchema(string $tenantId): void
    {
        $tenantConnection = DriverManager::getConnection(params: [
            'driver' => 'pdo_mysql',
            'host' => $this->writerHost,
            'port' => $this->port,
            'dbname' => $tenantId,
            'user' => $this->serverUsername,
            'password' => $this->serverPassword,
            'charset' => 'utf8mb4',
        ]);

        try {
            $entityManager = new EntityManager(
                conn: $tenantConnection,
                config: $this->tenantEntityManager->getConfiguration(),
            );

            $metadata = $entityManager->getMetadataFactory()->getAllMetadata();
            if (empty($metadata)) {
                return;
            }

            (new SchemaTool(em: $entityManager))->updateSchema(classes: $metadata);
        } finally {
            $tenantConnection->close();
        }
    }
}
