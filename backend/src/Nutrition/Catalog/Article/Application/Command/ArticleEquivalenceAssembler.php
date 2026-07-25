<?php

namespace Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\Article\Domain\Model\ArticleEquivalence;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ArticleEquivalenceAssembler
{
    public function __construct(
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    /**
     * @param ArticleEquivalenceData[] $equivalences
     *
     * @return ArticleEquivalence[]
     */
    public function assemble(string $articleId, array $equivalences, string $userId): array
    {
        return array_map(
            callback: fn (ArticleEquivalenceData $equivalenceData): ArticleEquivalence => ArticleEquivalence::create(
                articleId: $articleId,
                unit: $equivalenceData->unit,
                quantity: $equivalenceData->quantity,
                position: $equivalenceData->position,
                createdByUserId: $userId,
                dateTimeGenerator: $this->dateTimeGenerator,
            ),
            array: $equivalences,
        );
    }
}
