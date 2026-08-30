<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\Service;

use Doctrine\DBAL\Connection;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Diary\Diary\Domain\Model\DiaryLotComposition;
use Nutrition\Diary\Diary\Domain\Service\DiaryLotCompositionProvider;

final class DoctrineDiaryLotCompositionProvider implements DiaryLotCompositionProvider
{
    private const string KIND_ARTICLE = 'article';

    /** @var array<string, ?DiaryLotComposition> */
    private array $compositions = [];

    public function __construct(private readonly Connection $connection)
    {
    }

    public function findComposition(string $productionItemId): ?DiaryLotComposition
    {
        if (array_key_exists(key: $productionItemId, array: $this->compositions)) {
            return $this->compositions[$productionItemId];
        }

        return $this->compositions[$productionItemId] = $this->compositionOf(
            productionItemId: $productionItemId,
            visited: [],
        );
    }

    /**
     * @param array<int, string> $visited
     */
    private function compositionOf(string $productionItemId, array $visited): ?DiaryLotComposition
    {
        if (in_array(needle: $productionItemId, haystack: $visited, strict: true)) {
            return null;
        }

        $item = $this->connection->createQueryBuilder()
            ->select('i.id', 'i.recipe_id', 'i.servings_cooked')
            ->from(table: 'production_item', alias: 'i')
            ->where('i.id = :productionItemId')
            ->setParameter(key: 'productionItemId', value: $productionItemId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $item) {
            return null;
        }

        $servingsCooked = (float) $item['servings_cooked'];

        if ($servingsCooked <= 0.0) {
            return null;
        }

        $rows = $this->connection->createQueryBuilder()
            ->select('c.kind', 'c.ref_id', 'c.quantity', 'c.source_production_item_id')
            ->from(table: 'production_item_consumption', alias: 'c')
            ->where('c.production_item_id = :productionItemId')
            ->setParameter(key: 'productionItemId', value: $productionItemId)
            ->orderBy('c.kind', 'DESC')
            ->addOrderBy('c.created_at', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        if ([] === $rows) {
            return null;
        }

        return new DiaryLotComposition(
            productionItemId: $item['id'],
            recipeId: $item['recipe_id'],
            ingredientsPerServing: array_map(
                callback: fn (array $row): array => $this->toIngredient(
                    row: $row,
                    servingsCooked: $servingsCooked,
                    visited: array_merge($visited, [$productionItemId]),
                ),
                array: $rows,
            ),
        );
    }

    /**
     * @param array<string, mixed> $row
     * @param array<int, string>   $visited
     *
     * @return array{kind: string, refId: string, quantity: float, unit: ?string, composition?: array<int, array<string, mixed>>}
     */
    private function toIngredient(array $row, float $servingsCooked, array $visited): array
    {
        $ingredient = [
            'kind' => self::KIND_ARTICLE === $row['kind'] ? DiaryEntryNode::KIND_PRODUCT : DiaryEntryNode::KIND_RECIPE,
            'refId' => $row['ref_id'],
            'quantity' => (float) $row['quantity'] / $servingsCooked,
            'unit' => null,
        ];

        if (self::KIND_ARTICLE === $row['kind'] || null === $row['source_production_item_id']) {
            return $ingredient;
        }

        $source = $this->compositionOf(productionItemId: $row['source_production_item_id'], visited: $visited);

        if (null === $source) {
            return $ingredient;
        }

        return [...$ingredient, 'composition' => $source->ingredientsPerServing];
    }
}
