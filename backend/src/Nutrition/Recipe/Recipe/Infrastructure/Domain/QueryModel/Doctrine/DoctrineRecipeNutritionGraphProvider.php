<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeNutritionGraph;

final class DoctrineRecipeNutritionGraphProvider
{
    public function __construct(private readonly Connection $connection)
    {
    }

    public function load(): RecipeNutritionGraph
    {
        $articles = [];
        $articleMacrosPerUnit = [];

        foreach ($this->fetchArticles() as $row) {
            $articles[$row['id']] = [
                'name' => $row['name'],
                'emoji' => $row['emoji'] ?? '🍽️',
                'image' => $row['image'] ?? null,
                'baseUnit' => $row['base_unit'] ?? 'g',
            ];

            $reference = (float) ($row['reference_amount'] ?? 0);
            $articleMacrosPerUnit[$row['id']] = $reference <= 0
                ? MacroBreakdown::zero()
                : new MacroBreakdown(
                    calories: (float) ($row['calories'] ?? 0) / $reference,
                    protein: (float) ($row['protein'] ?? 0) / $reference,
                    fat: (float) ($row['fat'] ?? 0) / $reference,
                    carbs: (float) ($row['carbs'] ?? 0) / $reference,
                );
        }

        return new RecipeNutritionGraph(
            articleMacrosPerUnit: $articleMacrosPerUnit,
            articles: $articles,
            articleUnitFactors: $this->loadArticleUnitFactors(),
            recipes: $this->loadRecipes(),
        );
    }

    /**
     * @return array<string, array<string, float>>
     */
    private function loadArticleUnitFactors(): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('e.article_id', 'e.unit', 'e.quantity')
            ->from(table: 'article_equivalence', alias: 'e')
            ->executeQuery()
            ->fetchAllAssociative();

        $factors = [];

        foreach ($rows as $row) {
            $factors[$row['article_id']][$row['unit']] = (float) $row['quantity'];
        }

        return $factors;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function fetchArticles(): array
    {
        return $this->connection->createQueryBuilder()
            ->select(
                'a.id',
                'a.name',
                'a.emoji',
                'a.image',
                'a.base_unit',
                'nf.reference_amount',
                'nf.calories',
                'nf.protein',
                'nf.fat',
                'nf.carbs'
            )
            ->from(table: 'article', alias: 'a')
            ->leftJoin('a', 'nutrition_facts', 'nf', 'nf.id = a.nutrition_facts_id')
            ->executeQuery()
            ->fetchAllAssociative();
    }

    /**
     * @return array<string, array{servings: int, name: string, emoji: string, image: ?string, ingredients: array<int, array{kind: string, refId: string, quantity: float}>}>
     */
    private function loadRecipes(): array
    {
        $recipes = [];

        foreach ($this->fetchRecipes() as $row) {
            $recipes[$row['id']] = [
                'servings' => max(1, (int) $row['servings']),
                'name' => $row['name'],
                'emoji' => $row['emoji'] ?? '🍲',
                'image' => $row['image'] ?? null,
                'ingredients' => [],
            ];
        }

        foreach ($this->fetchIngredients() as $row) {
            if (!isset($recipes[$row['recipe_id']])) {
                continue;
            }

            $recipes[$row['recipe_id']]['ingredients'][] = [
                'kind' => $row['kind'],
                'refId' => $row['ref_id'],
                'quantity' => (float) $row['quantity'],
                'unit' => null !== $row['unit'] ? (string) $row['unit'] : null,
            ];
        }

        return $recipes;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function fetchRecipes(): array
    {
        return $this->connection->createQueryBuilder()
            ->select('r.id', 'r.name', 'r.emoji', 'r.image', 'r.servings')
            ->from(table: 'recipe', alias: 'r')
            ->executeQuery()
            ->fetchAllAssociative();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function fetchIngredients(): array
    {
        return $this->connection->createQueryBuilder()
            ->select('ri.recipe_id', 'ri.kind', 'ri.ref_id', 'ri.quantity', 'ri.unit', 'ri.position')
            ->from(table: 'recipe_ingredient', alias: 'ri')
            ->orderBy('ri.position', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();
    }
}
