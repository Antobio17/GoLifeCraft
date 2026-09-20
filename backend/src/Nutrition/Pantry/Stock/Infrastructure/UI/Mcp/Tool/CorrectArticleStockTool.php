<?php

namespace Nutrition\Pantry\Stock\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool\McpMessengerTool;
use Mcp\Capability\Attribute\McpTool;
use Nutrition\Pantry\Movement\Application\Command\CorrectArticleStockCommand;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(
    name: 'correct_article_stock',
    description: 'Put an article\'s stock back where it really is, in one shot, without walking the whole pantry. It writes a count into the stock ledger dated now, so it beats everything logged before it and raises the confidence of the estimate again; the older movements stay where they are. Use it whenever somebody says how much is left, in whatever words: "quedan unos 300 g" is kind "measured" with quantity 300, "medio paquete" is kind "fraction" with quantity 0.5, "queda poco" is kind "level" with level "low", and "se ha acabado" is kind "level" with level "empty". A fraction and a level are turned into grams using the article\'s pack size, so they need the article to have a pack or an earlier count to measure against; when it has neither, ask for an amount instead. Read the result back with query_model on "article_stock".',
)]
final class CorrectArticleStockTool extends McpMessengerTool
{
    /**
     * @param string  $articleId   Id of the article being corrected
     * @param string  $kind        "measured" for an amount somebody read or guessed, "fraction" for a part of a pack, "level" for a word
     * @param ?float  $quantity    The amount for "measured", or the part of a pack for "fraction" where 0.5 is half a pack and 0.25 a quarter. Ignored for "level"
     * @param ?string $unit        Unit the amount was given in when it is not the article's base unit, for example "pack" or "can". Only for "measured"
     * @param ?string $level       "empty", "low", "medium", "high" or "full". Only for "level"
     * @param ?string $effectiveAt Day the article was looked at, as "YYYY-MM-DD", when it was not today. The count then lands at the end of that day
     */
    public function __invoke(
        string $articleId,
        string $kind = 'measured',
        ?float $quantity = null,
        ?string $unit = null,
        ?string $level = null,
        ?string $effectiveAt = null,
    ): array {
        return $this->dispatch(messageFactory: fn () => new CorrectArticleStockCommand(
            articleId: $articleId,
            kind: $kind,
            quantity: $quantity,
            unit: $unit,
            level: $level,
            effectiveAt: $effectiveAt,
            correctedByUserId: RequestExtractor::getUserSessionId(request: $this->request()),
        ));
    }
}
