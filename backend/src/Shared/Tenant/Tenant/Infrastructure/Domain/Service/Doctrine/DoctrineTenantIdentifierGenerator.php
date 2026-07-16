<?php

namespace Shared\Tenant\Tenant\Infrastructure\Domain\Service\Doctrine;

use Doctrine\DBAL\Connection;
use Shared\Tenant\Tenant\Domain\Service\TenantIdentifierGenerator;

final readonly class DoctrineTenantIdentifierGenerator implements TenantIdentifierGenerator
{
    private const string PREFIX = 'GLC';
    private const int SEQUENCE_LENGTH = 10;

    public function __construct(private Connection $connection)
    {
    }

    public function next(): string
    {
        $max = $this->connection->createQueryBuilder()
            ->select('MAX(tenant_id)')
            ->from(table: 'user')
            ->where('tenant_id LIKE :prefix')
            ->setParameter(key: 'prefix', value: self::PREFIX.'%')
            ->executeQuery()
            ->fetchOne();

        $current = false === $max || null === $max
            ? 0
            : (int) substr(string: (string) $max, offset: strlen(string: self::PREFIX));

        $sequence = str_pad(
            string: (string) ($current + 1),
            length: self::SEQUENCE_LENGTH,
            pad_string: '0',
            pad_type: STR_PAD_LEFT,
        );

        return self::PREFIX.$sequence;
    }
}
