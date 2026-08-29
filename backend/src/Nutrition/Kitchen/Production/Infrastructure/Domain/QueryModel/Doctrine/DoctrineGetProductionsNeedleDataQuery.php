<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionsResult;
use Nutrition\Kitchen\Production\Domain\QueryModel\GetProductionsNeedleDataQuery;

final readonly class DoctrineGetProductionsNeedleDataQuery implements GetProductionsNeedleDataQuery
{
    private const array SORTABLE_COLUMNS = [
        'fromDate' => 'from_date',
        'toDate' => 'to_date',
        'status' => 'status',
        'createdAt' => 'created_at',
    ];

    public function __construct(private Connection $connection)
    {
    }

    public function findProductions(int $pageSize, int $pageNumber, ?string $orderBy = null): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                'p.id',
                'p.from_date',
                'p.to_date',
                'p.status',
                'p.created_at',
                'p.updated_at',
                'p.created_by_user_id',
                'p.updated_by_user_id'
            )
            ->from(table: 'production', alias: 'p')
            ->orderBy(...$this->resolveOrderBy(orderBy: $orderBy))
            ->addOrderBy('p.created_at', 'DESC')
            ->setFirstResult(firstResult: ($pageNumber - 1) * $pageSize)
            ->setMaxResults(maxResults: $pageSize)
            ->executeQuery()
            ->fetchAllAssociative();

        $summaries = $this->summariesOf(productionIds: array_column(array: $rows, column_key: 'id'));
        $utc = new \DateTimeZone(timezone: 'UTC');

        return array_map(callback: static function (array $row) use ($summaries, $utc): GetProductionsResult {
            $summary = $summaries[$row['id']] ?? [
                'itemCount' => 0,
                'cookedCount' => 0,
                'servingsPlanned' => 0.0,
                'servingsCooked' => 0.0,
                'emojis' => [],
            ];

            return new GetProductionsResult(
                id: $row['id'],
                aggregateName: 'Production',
                fromDate: $row['from_date'],
                toDate: $row['to_date'],
                status: $row['status'],
                itemCount: $summary['itemCount'],
                cookedCount: $summary['cookedCount'],
                servingsPlanned: $summary['servingsPlanned'],
                servingsCooked: $summary['servingsCooked'],
                emojis: $summary['emojis'],
                createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
                updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
                createdByUserId: $row['created_by_user_id'],
                updatedByUserId: $row['updated_by_user_id'],
            );
        }, array: $rows);
    }

    public function totalProductions(): int
    {
        return (int) $this->connection->createQueryBuilder()
            ->select('COUNT(p.id)')
            ->from(table: 'production', alias: 'p')
            ->executeQuery()
            ->fetchOne();
    }

    /**
     * @param string[] $productionIds
     *
     * @return array<string, array{itemCount: int, cookedCount: int, servingsPlanned: float, servingsCooked: float, emojis: string[]}>
     */
    private function summariesOf(array $productionIds): array
    {
        if ([] === $productionIds) {
            return [];
        }

        $rows = $this->connection->createQueryBuilder()
            ->select('i.production_id', 'i.status', 'i.servings_planned', 'i.servings_cooked', 'i.emoji_snapshot')
            ->from(table: 'production_item', alias: 'i')
            ->where('i.production_id IN (:productionIds)')
            ->setParameter(key: 'productionIds', value: $productionIds, type: ArrayParameterType::STRING)
            ->orderBy('i.position', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $summaries = [];

        foreach ($rows as $row) {
            $productionId = $row['production_id'];

            $summaries[$productionId] ??= [
                'itemCount' => 0,
                'cookedCount' => 0,
                'servingsPlanned' => 0.0,
                'servingsCooked' => 0.0,
                'emojis' => [],
            ];

            ++$summaries[$productionId]['itemCount'];
            $summaries[$productionId]['servingsPlanned'] += (float) $row['servings_planned'];
            $summaries[$productionId]['servingsCooked'] += (float) $row['servings_cooked'];
            $summaries[$productionId]['emojis'][] = $row['emoji_snapshot'];

            if (ProductionItem::STATUS_DONE !== $row['status']) {
                continue;
            }

            ++$summaries[$productionId]['cookedCount'];
        }

        return $summaries;
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function resolveOrderBy(?string $orderBy): array
    {
        $descending = str_starts_with(haystack: (string) $orderBy, needle: '-');
        $field = ltrim(string: (string) $orderBy, characters: '-');
        $column = self::SORTABLE_COLUMNS[$field] ?? 'from_date';

        return ['p.'.$column, $descending || null === $orderBy ? 'DESC' : 'ASC'];
    }
}
