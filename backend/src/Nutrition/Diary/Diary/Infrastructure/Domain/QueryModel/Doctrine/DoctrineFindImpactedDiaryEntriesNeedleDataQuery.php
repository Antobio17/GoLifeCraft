<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Nutrition\Diary\Diary\Domain\QueryModel\FindImpactedDiaryEntriesNeedleDataQuery;
use Nutrition\Recipe\Recipe\Domain\Service\RecipeNutritionCalculator;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;

final readonly class DoctrineFindImpactedDiaryEntriesNeedleDataQuery implements FindImpactedDiaryEntriesNeedleDataQuery
{
    private const string TIMEZONE = 'Europe/Madrid';

    public function __construct(
        private Connection $connection,
        private DoctrineRecipeNutritionGraphProvider $graphProvider,
        private RecipeNutritionCalculator $calculator,
    ) {
    }

    public function findTodayImpactedEntryIds(string $changedRefId): array
    {
        return $this->entryIdsImpactedByRefs(baseRefIds: [$changedRefId]);
    }

    public function findTodayImpactedEntryIdsForNutritionFacts(string $nutritionFactsId): array
    {
        $articleIds = $this->connection->createQueryBuilder()
            ->select('a.id')
            ->from(table: 'article', alias: 'a')
            ->where('a.nutrition_facts_id = :nutritionFactsId')
            ->setParameter(key: 'nutritionFactsId', value: $nutritionFactsId)
            ->executeQuery()
            ->fetchFirstColumn();

        return $this->entryIdsImpactedByRefs(baseRefIds: $articleIds);
    }

    /**
     * @param array<int, string> $baseRefIds
     *
     * @return array<int, string>
     */
    private function entryIdsImpactedByRefs(array $baseRefIds): array
    {
        if ([] === $baseRefIds) {
            return [];
        }

        $graph = $this->graphProvider->load();

        $impactedRefIds = $baseRefIds;
        foreach ($baseRefIds as $refId) {
            $impactedRefIds = array_merge($impactedRefIds, $this->calculator->recipesContaining(graph: $graph, refId: $refId));
        }
        $impactedRefIds = array_values(array_unique($impactedRefIds));

        return $this->connection->createQueryBuilder()
            ->select('e.id')
            ->from(table: 'diary_entry', alias: 'e')
            ->where('e.entry_date = :date')
            ->andWhere('e.ref_id IN (:refIds)')
            ->setParameter(key: 'date', value: $this->today())
            ->setParameter(key: 'refIds', value: $impactedRefIds, type: ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchFirstColumn();
    }

    private function today(): string
    {
        return (new \DateTime(datetime: 'now', timezone: new \DateTimeZone(timezone: self::TIMEZONE)))
            ->format(format: 'Y-m-d');
    }
}
