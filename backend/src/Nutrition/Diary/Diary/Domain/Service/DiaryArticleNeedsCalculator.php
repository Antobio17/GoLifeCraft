<?php

namespace Nutrition\Diary\Diary\Domain\Service;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeNutritionGraph;

final class DiaryArticleNeedsCalculator
{
    /**
     * @param array<int, array{kind: string, refId: string, quantity: float, unit: ?string}> $items
     *
     * @return array<string, float>
     */
    public function accumulate(RecipeNutritionGraph $graph, array $items): array
    {
        $needs = [];
        $this->accumulateInto(graph: $graph, items: $items, multiplier: 1.0, needs: $needs, stack: []);

        return $needs;
    }

    /**
     * @param array<int, array{kind: string, refId: string, quantity: float, unit: ?string}> $items
     * @param array<string, float>                                                           $needs
     * @param array<int, string>                                                             $stack
     */
    private function accumulateInto(RecipeNutritionGraph $graph, array $items, float $multiplier, array &$needs, array $stack): void
    {
        foreach ($items as $item) {
            if (DiaryEntryNode::KIND_PRODUCT === $item['kind']) {
                $quantity = $item['quantity'] * $graph->articleUnitFactor(articleId: $item['refId'], unit: $item['unit'] ?? null) * $multiplier;
                $needs[$item['refId']] = ($needs[$item['refId']] ?? 0.0) + $quantity;

                continue;
            }

            if (!$graph->hasRecipe(recipeId: $item['refId']) || in_array(needle: $item['refId'], haystack: $stack, strict: true)) {
                continue;
            }

            $this->accumulateInto(
                graph: $graph,
                items: $graph->recipeIngredients(recipeId: $item['refId']),
                multiplier: $multiplier * ($item['quantity'] / $graph->recipeServings(recipeId: $item['refId'])),
                needs: $needs,
                stack: array_merge($stack, [$item['refId']]),
            );
        }
    }
}
