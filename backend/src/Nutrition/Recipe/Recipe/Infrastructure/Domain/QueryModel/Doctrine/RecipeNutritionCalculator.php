<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeIngredient;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final class RecipeNutritionCalculator
{
    private bool $loaded = false;

    /** @var array<string, MacroBreakdown> */
    private array $articleMacrosPerUnit = [];

    /** @var array<string, array{name: string, emoji: string}> */
    private array $articles = [];

    /** @var array<string, array{servings: int, name: string, emoji: string, ingredients: array<int, array{kind: string, refId: string, quantity: float}>}> */
    private array $recipes = [];

    public function __construct(private readonly Connection $connection)
    {
    }

    public function totalsFor(string $recipeId): MacroBreakdown
    {
        $this->load();

        return $this->recipeTotals(recipeId: $recipeId, stack: []);
    }

    public function perServingFor(string $recipeId): MacroBreakdown
    {
        $this->load();

        $servings = max(1, $this->recipes[$recipeId]['servings'] ?? 1);

        return $this->recipeTotals(recipeId: $recipeId, stack: [])->scale(factor: 1 / $servings);
    }

    public function ingredientContribution(string $kind, string $refId, float $quantity): MacroBreakdown
    {
        $this->load();

        return $this->contribution(kind: $kind, refId: $refId, quantity: $quantity, stack: []);
    }

    public function articleName(string $articleId): ?string
    {
        $this->load();

        return $this->articles[$articleId]['name'] ?? null;
    }

    public function articleEmoji(string $articleId): string
    {
        $this->load();

        return $this->articles[$articleId]['emoji'] ?? '🍽️';
    }

    public function recipeName(string $recipeId): ?string
    {
        $this->load();

        return $this->recipes[$recipeId]['name'] ?? null;
    }

    public function recipeEmoji(string $recipeId): string
    {
        $this->load();

        return $this->recipes[$recipeId]['emoji'] ?? '🍲';
    }

    private function recipeTotals(string $recipeId, array $stack): MacroBreakdown
    {
        if (!isset($this->recipes[$recipeId]) || in_array(needle: $recipeId, haystack: $stack, strict: true)) {
            return MacroBreakdown::zero();
        }

        $nextStack = array_merge($stack, [$recipeId]);
        $total = MacroBreakdown::zero();

        foreach ($this->recipes[$recipeId]['ingredients'] as $ingredient) {
            $total = $total->add(other: $this->contribution(
                kind: $ingredient['kind'],
                refId: $ingredient['refId'],
                quantity: $ingredient['quantity'],
                stack: $nextStack,
            ));
        }

        return $total;
    }

    private function contribution(string $kind, string $refId, float $quantity, array $stack): MacroBreakdown
    {
        if (RecipeIngredient::KIND_PRODUCT === $kind) {
            $perUnit = $this->articleMacrosPerUnit[$refId] ?? null;

            return null === $perUnit ? MacroBreakdown::zero() : $perUnit->scale(factor: $quantity);
        }

        if (!isset($this->recipes[$refId])) {
            return MacroBreakdown::zero();
        }

        $servings = max(1, $this->recipes[$refId]['servings']);

        return $this->recipeTotals(recipeId: $refId, stack: $stack)->scale(factor: $quantity / $servings);
    }

    private function load(): void
    {
        if ($this->loaded) {
            return;
        }

        $this->loadArticles();
        $this->loadRecipes();
        $this->loaded = true;
    }

    private function loadArticles(): void
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                'a.id',
                'a.name',
                'a.emoji',
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

        foreach ($rows as $row) {
            $this->articles[$row['id']] = [
                'name' => $row['name'],
                'emoji' => $row['emoji'] ?? '🍽️',
            ];

            $reference = (float) ($row['reference_amount'] ?? 0);
            if ($reference <= 0) {
                $this->articleMacrosPerUnit[$row['id']] = MacroBreakdown::zero();
                continue;
            }

            $this->articleMacrosPerUnit[$row['id']] = new MacroBreakdown(
                calories: (float) ($row['calories'] ?? 0) / $reference,
                protein: (float) ($row['protein'] ?? 0) / $reference,
                fat: (float) ($row['fat'] ?? 0) / $reference,
                carbs: (float) ($row['carbs'] ?? 0) / $reference,
            );
        }
    }

    private function loadRecipes(): void
    {
        $recipeRows = $this->connection->createQueryBuilder()
            ->select('r.id', 'r.name', 'r.emoji', 'r.servings')
            ->from(table: 'recipe', alias: 'r')
            ->executeQuery()
            ->fetchAllAssociative();

        foreach ($recipeRows as $row) {
            $this->recipes[$row['id']] = [
                'servings' => max(1, (int) $row['servings']),
                'name' => $row['name'],
                'emoji' => $row['emoji'] ?? '🍲',
                'ingredients' => [],
            ];
        }

        $ingredientRows = $this->connection->createQueryBuilder()
            ->select('ri.recipe_id', 'ri.kind', 'ri.ref_id', 'ri.quantity', 'ri.position')
            ->from(table: 'recipe_ingredient', alias: 'ri')
            ->orderBy('ri.position', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        foreach ($ingredientRows as $row) {
            if (!isset($this->recipes[$row['recipe_id']])) {
                continue;
            }

            $this->recipes[$row['recipe_id']]['ingredients'][] = [
                'kind' => $row['kind'],
                'refId' => $row['ref_id'],
                'quantity' => (float) $row['quantity'],
            ];
        }
    }
}
