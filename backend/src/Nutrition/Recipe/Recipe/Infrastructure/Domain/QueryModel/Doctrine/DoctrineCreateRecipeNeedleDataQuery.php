<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Recipe\Recipe\Domain\QueryModel\CreateRecipeNeedleDataQuery;

final readonly class DoctrineCreateRecipeNeedleDataQuery implements CreateRecipeNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function recipeWithNameAlreadyExists(
        string $name,
    ): bool {
        return (int) $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: 'recipe', alias: 'r')
            ->where('r.name = :name')
            ->setParameter(key: 'name', value: $name)
            ->executeQuery()
            ->fetchOne() > 0;
    }
}
