<?php

namespace Nutrition\GlobalCatalog\Article\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool\McpMessengerTool;
use Mcp\Capability\Attribute\McpTool;
use Nutrition\GlobalCatalog\Article\Application\Query\GetGlobalArticlesQuery;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto\GetGlobalArticlesResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

#[McpTool(
    name: 'query_global_articles',
    description: 'Search the global article catalog shared by the whole application: products synced from OpenFoodFacts and supermarkets. Returns every stored field of each article (barcode, brand, category, images, quantity, stores, prices and nutrition values per referenceAmount grams, plus audit timestamps), and can be filtered by source. Read-only and not tenant specific, so these articles are not the ones the user owns: use query_model with alias "article" for that.',
)]
final class QueryGlobalArticlesTool extends McpMessengerTool
{
    private const int MAX_PAGE_SIZE = 100;

    /**
     * @param string|null $name     Free text matched against the article name and brand
     * @param string|null $source   Catalog the article comes from: "openfoodfacts" or "mercadona"
     * @param string|null $category Exact category name, as returned in the categoryName of previous results
     * @param string|null $orderBy  "name" or "updatedAt", prefixed with "-" for descending order
     */
    public function __invoke(
        ?string $name = null,
        ?string $source = null,
        ?string $category = null,
        ?string $orderBy = null,
        int $page = 1,
        int $pageSize = 20,
    ): array {
        $pageNumber = max(1, $page);
        $size = min(self::MAX_PAGE_SIZE, max(1, $pageSize));

        return $this->dispatch(
            messageFactory: fn () => new GetGlobalArticlesQuery(
                pageNumber: $pageNumber,
                pageSize: $size,
                filterName: $name,
                filterSource: $source,
                filterCategory: $category,
                orderBy: $orderBy,
            ),
            resultMapper: fn (QueryCollectionResult $result) => [
                'meta' => [
                    'page' => $result->pageNumber,
                    'pageSize' => $result->pageSize,
                    'total' => $result->total,
                ],
                'data' => array_map(
                    callback: fn (GetGlobalArticlesResult $article) => $this->mapArticle(article: $article),
                    array: $result->items,
                ),
            ],
        );
    }

    private function mapArticle(GetGlobalArticlesResult $article): array
    {
        return [
            'id' => $article->id,
            'barcode' => $article->barcode,
            'name' => $article->name,
            'brand' => $article->brand,
            'categoryName' => $article->categoryName,
            'imageUrl' => $article->imageUrl,
            'quantity' => $article->quantity,
            'stores' => $article->stores,
            'source' => $article->source,
            'price' => $article->price,
            'bulkPrice' => $article->bulkPrice,
            'referencePrice' => $article->referencePrice,
            'referenceFormat' => $article->referenceFormat,
            'previousPrice' => $article->previousPrice,
            'referenceAmount' => $article->referenceAmount,
            'calories' => $article->calories,
            'protein' => $article->protein,
            'carbs' => $article->carbs,
            'sugars' => $article->sugars,
            'fat' => $article->fat,
            'saturatedFat' => $article->saturatedFat,
            'fiber' => $article->fiber,
            'salt' => $article->salt,
            'createdAt' => $article->createdAt->format(format: \DateTimeInterface::ATOM),
            'updatedAt' => $article->updatedAt->format(format: \DateTimeInterface::ATOM),
            'createdByUserId' => $article->createdByUserId,
            'updatedByUserId' => $article->updatedByUserId,
        ];
    }
}
