<?php

namespace Nutrition\Pantry\Location\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;
use Nutrition\Pantry\Location\Domain\Model\Location;
use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationCandidatesResult;
use Nutrition\Pantry\Location\Domain\QueryModel\GetLocationCandidatesNeedleDataQuery;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Search\SearchFilter;

/**
 * Articles and recipes live in separate tables, so the candidate list is the two searched
 * apart and merged here rather than a UNION: it keeps SearchFilter's matching identical to
 * every other search box in the app, at the price of paging a personal-sized catalogue in
 * PHP instead of in the database.
 */
final readonly class DoctrineGetLocationCandidatesNeedleDataQuery implements GetLocationCandidatesNeedleDataQuery
{
    private const string RECIPE_UNIT = 'serving';

    public function __construct(private Connection $connection)
    {
    }

    public function locationExists(string $locationId): bool
    {
        $result = $this->connection->createQueryBuilder()
            ->select('l.id')
            ->from(table: 'pantry_location', alias: 'l')
            ->where('l.id = :locationId')
            ->setParameter(key: 'locationId', value: $locationId)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();

        return false !== $result;
    }

    public function findCandidates(
        string $locationId,
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $filterKind = null,
    ): array {
        $candidates = $this->matching(locationId: $locationId, filterName: $filterName, filterKind: $filterKind);

        return array_slice(array: $candidates, offset: ($pageNumber - 1) * $pageSize, length: $pageSize);
    }

    public function totalCandidates(
        string $locationId,
        ?string $filterName = null,
        ?string $filterKind = null,
    ): int {
        return count(value: $this->matching(locationId: $locationId, filterName: $filterName, filterKind: $filterKind));
    }

    /**
     * @return GetLocationCandidatesResult[]
     */
    private function matching(string $locationId, ?string $filterName, ?string $filterKind): array
    {
        $candidates = [];

        if (Location::ITEM_RECIPE !== $filterKind) {
            $candidates = array_merge($candidates, $this->articles(locationId: $locationId, filterName: $filterName));
        }

        if (Location::ITEM_ARTICLE !== $filterKind) {
            $candidates = array_merge($candidates, $this->recipes(locationId: $locationId, filterName: $filterName));
        }

        usort(array: $candidates, callback: static function (GetLocationCandidatesResult $a, GetLocationCandidatesResult $b): int {
            return [null !== $a->locationId, $a->name] <=> [null !== $b->locationId, $b->name];
        });

        return $candidates;
    }

    /**
     * @return GetLocationCandidatesResult[]
     */
    private function articles(string $locationId, ?string $filterName): array
    {
        $qb = $this->connection->createQueryBuilder()
            ->select(
                'a.id AS ref_id',
                'a.name',
                'a.emoji',
                'a.base_unit',
                's.quantity',
                's.location_id',
                'pl.name AS location_name',
            )
            ->from(table: 'article', alias: 'a')
            ->leftJoin(fromAlias: 'a', join: 'article_stock', alias: 's', condition: 's.article_id = a.id')
            ->leftJoin(fromAlias: 's', join: 'pantry_location', alias: 'pl', condition: 'pl.id = s.location_id');

        $this->excludeOwn(qb: $qb, locationId: $locationId, alias: 's');
        SearchFilter::apply(queryBuilder: $qb, needle: $filterName, columns: ['a.name']);

        return array_map(callback: static function (array $row): GetLocationCandidatesResult {
            return new GetLocationCandidatesResult(
                id: $row['ref_id'],
                aggregateName: 'PantryLocationCandidate',
                kind: Location::ITEM_ARTICLE,
                refId: $row['ref_id'],
                name: $row['name'],
                emoji: (string) ($row['emoji'] ?? ''),
                unit: (string) ($row['base_unit'] ?? 'g'),
                quantity: (float) ($row['quantity'] ?? 0.0),
                locationId: $row['location_id'],
                locationName: $row['location_name'],
            );
        }, array: $qb->executeQuery()->fetchAllAssociative());
    }

    /**
     * @return GetLocationCandidatesResult[]
     */
    private function recipes(string $locationId, ?string $filterName): array
    {
        $qb = $this->connection->createQueryBuilder()
            ->select(
                'r.id AS ref_id',
                'r.name',
                'r.emoji',
                's.servings AS quantity',
                's.location_id',
                'pl.name AS location_name',
            )
            ->from(table: 'recipe', alias: 'r')
            ->leftJoin(fromAlias: 'r', join: 'recipe_stock', alias: 's', condition: 's.recipe_id = r.id')
            ->leftJoin(fromAlias: 's', join: 'pantry_location', alias: 'pl', condition: 'pl.id = s.location_id');

        $this->excludeOwn(qb: $qb, locationId: $locationId, alias: 's');
        SearchFilter::apply(queryBuilder: $qb, needle: $filterName, columns: ['r.name']);

        return array_map(callback: static function (array $row): GetLocationCandidatesResult {
            return new GetLocationCandidatesResult(
                id: $row['ref_id'],
                aggregateName: 'PantryLocationCandidate',
                kind: Location::ITEM_RECIPE,
                refId: $row['ref_id'],
                name: $row['name'],
                emoji: (string) ($row['emoji'] ?? ''),
                unit: self::RECIPE_UNIT,
                quantity: (float) ($row['quantity'] ?? 0.0),
                locationId: $row['location_id'],
                locationName: $row['location_name'],
            );
        }, array: $qb->executeQuery()->fetchAllAssociative());
    }

    private function excludeOwn(QueryBuilder $qb, string $locationId, string $alias): void
    {
        $qb
            ->andWhere(sprintf('(%s.location_id IS NULL OR %s.location_id != :ownLocationId)', $alias, $alias))
            ->setParameter(key: 'ownLocationId', value: $locationId);
    }
}
