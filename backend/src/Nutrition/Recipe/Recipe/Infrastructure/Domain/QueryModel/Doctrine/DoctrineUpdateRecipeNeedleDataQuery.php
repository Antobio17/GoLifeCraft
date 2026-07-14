<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Recipe\Recipe\Domain\QueryModel\UpdateRecipeNeedleDataQuery;

final readonly class DoctrineUpdateRecipeNeedleDataQuery implements UpdateRecipeNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function recipeWithNameAlreadyExists(
        string $name,
        string $excludingRecipeId,
    ): bool {
        return (int) $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: 'recipe', alias: 'r')
            ->where('r.name = :name')
            ->andWhere('r.id != :excludingId')
            ->setParameter(key: 'name', value: $name)
            ->setParameter(key: 'excludingId', value: $excludingRecipeId)
            ->executeQuery()
            ->fetchOne() > 0;
    }
}
