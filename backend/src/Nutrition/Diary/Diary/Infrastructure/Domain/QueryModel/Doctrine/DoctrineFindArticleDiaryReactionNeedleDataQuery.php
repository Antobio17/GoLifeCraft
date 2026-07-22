<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\QueryModel\FindArticleDiaryReactionNeedleDataQuery;

final readonly class DoctrineFindArticleDiaryReactionNeedleDataQuery implements FindArticleDiaryReactionNeedleDataQuery
{
    private const string TIMEZONE = 'Europe/Madrid';

    public function __construct(
        private Connection $connection,
    ) {
    }

    public function todayProductEntries(string $articleId): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('e.id', 'e.quantity')
            ->from(table: 'diary_entry', alias: 'e')
            ->where('e.entry_date = :date')
            ->andWhere('e.kind = :kind')
            ->andWhere('e.ref_id = :articleId')
            ->setParameter(key: 'date', value: $this->today())
            ->setParameter(key: 'kind', value: DiaryEntry::KIND_PRODUCT)
            ->setParameter(key: 'articleId', value: $articleId)
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(static fn (array $row): array => [
            'id' => $row['id'],
            'quantity' => (float) $row['quantity'],
        ], $rows);
    }

    public function articleNutrition(string $articleId): ?array
    {
        $row = $this->connection->createQueryBuilder()
            ->select('nf.reference_amount', 'nf.calories', 'nf.protein', 'nf.fat', 'nf.carbs')
            ->from(table: 'article', alias: 'a')
            ->innerJoin('a', 'nutrition_facts', 'nf', 'nf.id = a.nutrition_facts_id')
            ->where('a.id = :articleId')
            ->setParameter(key: 'articleId', value: $articleId)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        return [
            'referenceAmount' => (float) ($row['reference_amount'] ?? 0),
            'calories' => (float) ($row['calories'] ?? 0),
            'protein' => (float) ($row['protein'] ?? 0),
            'fat' => (float) ($row['fat'] ?? 0),
            'carbs' => (float) ($row['carbs'] ?? 0),
        ];
    }

    public function articleIdentityByNutritionFacts(string $nutritionFactsId): ?array
    {
        $row = $this->connection->createQueryBuilder()
            ->select('a.id', 'a.name', 'a.emoji')
            ->from(table: 'article', alias: 'a')
            ->where('a.nutrition_facts_id = :nutritionFactsId')
            ->setParameter(key: 'nutritionFactsId', value: $nutritionFactsId)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        return [
            'id' => $row['id'],
            'name' => $row['name'],
            'emoji' => $row['emoji'] ?? '🍽️',
        ];
    }

    private function today(): string
    {
        return (new \DateTime(datetime: 'now', timezone: new \DateTimeZone(timezone: self::TIMEZONE)))
            ->format(format: 'Y-m-d');
    }
}
