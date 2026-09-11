<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\GetTicketsResult;
use Nutrition\Shopping\Ticket\Domain\QueryModel\GetTicketsNeedleDataQuery;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Search\SearchFilter;

final readonly class DoctrineGetTicketsNeedleDataQuery implements GetTicketsNeedleDataQuery
{
    private const array ORDER_BY_COLUMNS = [
        'purchasedOn' => 't.purchased_on',
        'storeName' => 't.store_name',
        'total' => 't.total',
        'createdAt' => 't.created_at',
    ];

    public function __construct(private Connection $connection)
    {
    }

    public function findTickets(
        int $pageSize,
        int $pageNumber,
        ?string $filterStatus,
        ?string $filterSearch,
        ?string $orderBy,
    ): array {
        $queryBuilder = $this->connection->createQueryBuilder()
            ->select(
                't.id',
                't.store_name',
                't.supermarket_id',
                't.purchased_on',
                't.total',
                't.note',
                't.status',
                't.created_at',
                't.updated_at',
                't.created_by_user_id',
                't.updated_by_user_id',
                's.name AS supermarket_name',
                'COUNT(i.id) AS total_items',
                'SUM(CASE WHEN i.article_id IS NOT NULL THEN 1 ELSE 0 END) AS linked_items',
                'SUM(CASE WHEN i.received_at IS NOT NULL THEN 1 ELSE 0 END) AS received_items',
            )
            ->from(table: 'shopping_ticket', alias: 't')
            ->leftJoin(fromAlias: 't', join: 'shopping_ticket_item', alias: 'i', condition: 'i.ticket_id = t.id')
            ->leftJoin(fromAlias: 't', join: 'supermarket', alias: 's', condition: 't.supermarket_id = s.id')
            ->groupBy('t.id')
            ->addGroupBy('s.name')
            ->setFirstResult(firstResult: ($pageNumber - 1) * $pageSize)
            ->setMaxResults(maxResults: $pageSize);

        $this->applyFilters(queryBuilder: $queryBuilder, filterStatus: $filterStatus, filterSearch: $filterSearch);
        $this->applyOrder(queryBuilder: $queryBuilder, orderBy: $orderBy);

        return array_map(
            callback: static fn (array $row): GetTicketsResult => new GetTicketsResult(
                id: $row['id'],
                aggregateName: 'Ticket',
                storeName: $row['store_name'],
                supermarketId: $row['supermarket_id'],
                supermarketName: $row['supermarket_name'],
                purchasedOn: $row['purchased_on'],
                total: null !== $row['total'] ? (float) $row['total'] : null,
                note: $row['note'] ?? '',
                status: $row['status'],
                totalItems: (int) $row['total_items'],
                linkedItems: (int) $row['linked_items'],
                pendingItems: (int) $row['total_items'] - (int) $row['linked_items'],
                receivedItems: (int) $row['received_items'],
                createdAt: new \DateTime($row['created_at']),
                updatedAt: new \DateTime($row['updated_at']),
                createdByUserId: $row['created_by_user_id'],
                updatedByUserId: $row['updated_by_user_id'],
            ),
            array: $queryBuilder->executeQuery()->fetchAllAssociative(),
        );
    }

    public function totalTickets(?string $filterStatus, ?string $filterSearch): int
    {
        $queryBuilder = $this->connection->createQueryBuilder()
            ->select('COUNT(t.id)')
            ->from(table: 'shopping_ticket', alias: 't');

        $this->applyFilters(queryBuilder: $queryBuilder, filterStatus: $filterStatus, filterSearch: $filterSearch);

        return (int) $queryBuilder->executeQuery()->fetchOne();
    }

    private function applyFilters(QueryBuilder $queryBuilder, ?string $filterStatus, ?string $filterSearch): void
    {
        if (null !== $filterStatus) {
            $queryBuilder
                ->andWhere('t.status = :status')
                ->setParameter(key: 'status', value: $filterStatus);
        }

        SearchFilter::apply(queryBuilder: $queryBuilder, needle: $filterSearch, columns: ['t.store_name', 't.note']);
    }

    private function applyOrder(QueryBuilder $queryBuilder, ?string $orderBy): void
    {
        $column = self::ORDER_BY_COLUMNS[ltrim(string: (string) $orderBy, characters: '-')] ?? null;

        if (null === $column) {
            $queryBuilder->orderBy('t.purchased_on', 'DESC')->addOrderBy('t.created_at', 'DESC');

            return;
        }

        $queryBuilder->orderBy($column, str_starts_with(haystack: (string) $orderBy, needle: '-') ? 'DESC' : 'ASC');
    }
}
