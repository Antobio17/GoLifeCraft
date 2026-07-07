<?php

namespace Gym\Training\Session\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Gym\Training\Session\Domain\QueryModel\UpdateSessionNeedleDataQuery;

final readonly class DoctrineUpdateSessionNeedleDataQuery implements UpdateSessionNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function sessionWithNameAlreadyExists(
        string $name,
        string $excludingSessionId,
    ): bool {
        return (int) $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: 'training_session', alias: 's')
            ->where('s.name = :name')
            ->andWhere('s.id != :excludingId')
            ->setParameter(key: 'name', value: $name)
            ->setParameter(key: 'excludingId', value: $excludingSessionId)
            ->executeQuery()
            ->fetchOne() > 0;
    }
}
