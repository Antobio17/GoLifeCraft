<?php

namespace Gym\Training\Session\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Gym\Training\Session\Domain\QueryModel\CreateSessionNeedleDataQuery;

final readonly class DoctrineCreateSessionNeedleDataQuery implements CreateSessionNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function sessionWithNameAlreadyExists(
        string $name,
    ): bool {
        return (int) $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: 'training_session', alias: 's')
            ->where('s.name = :name')
            ->setParameter(key: 'name', value: $name)
            ->executeQuery()
            ->fetchOne() > 0;
    }
}
