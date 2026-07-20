<?php

namespace Nutrition\Shopping\Shopping\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Shopping\Shopping\Domain\QueryModel\AddShoppingListItemNeedleDataQuery;

final readonly class DoctrineAddShoppingListItemNeedleDataQuery implements AddShoppingListItemNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function articleExists(string $articleId): bool
    {
        return $this->exists(table: 'article', column: 'id', value: $articleId);
    }

    public function articleAlreadyInList(string $articleId): bool
    {
        return $this->exists(table: 'shopping_list_item', column: 'article_id', value: $articleId);
    }

    private function exists(string $table, string $column, string $value): bool
    {
        $count = $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: $table, alias: 't')
            ->where(sprintf('t.%s = :value', $column))
            ->setParameter(key: 'value', value: $value)
            ->executeQuery()
            ->fetchOne();

        return (int) $count > 0;
    }
}
