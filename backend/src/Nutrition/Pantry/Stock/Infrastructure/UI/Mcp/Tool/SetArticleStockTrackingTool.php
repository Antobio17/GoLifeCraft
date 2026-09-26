<?php

namespace Nutrition\Pantry\Stock\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool\McpMessengerTool;
use Mcp\Capability\Attribute\McpTool;
use Nutrition\Pantry\Stock\Application\Command\SetArticleStockTrackingCommand;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(
    name: 'set_article_stock_tracking',
    description: 'Decide how much effort an article\'s stock is worth. "exact" is for things counted one by one that never drift, like eggs, yoghurts, cans or units: the number is taken at face value and always carries full confidence. "approximate" is the default and is for everything nobody weighs, like rice, pasta, meat, peanut butter or vegetables: the number is kept but a band of doubt grows around it as meals are logged and cooking is done, until somebody looks at the shelf again. "none" is for things not worth controlling at all: the number is still kept but no level and no confidence are claimed, and nothing is ever said about having enough. Changing the mode recomputes the estimate straight away.',
)]
final class SetArticleStockTrackingTool extends McpMessengerTool
{
    /**
     * @param string $articleId    Id of the article
     * @param string $trackingMode "exact", "approximate" or "none"
     */
    public function __invoke(
        string $articleId,
        string $trackingMode,
    ): array {
        return $this->dispatch(messageFactory: fn () => new SetArticleStockTrackingCommand(
            articleId: $articleId,
            trackingMode: $trackingMode,
            updatedByUserId: RequestExtractor::getUserSessionId(request: $this->request()),
        ));
    }
}
