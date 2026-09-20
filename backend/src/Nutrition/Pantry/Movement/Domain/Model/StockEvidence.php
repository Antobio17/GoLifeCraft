<?php

namespace Nutrition\Pantry\Movement\Domain\Model;

enum StockEvidence: string
{
    case OBSERVATION = 'observation';
    case RECEIPT = 'receipt';
    case INFERENCE = 'inference';

    /**
     * @return array<int, string>
     */
    public static function inferredSources(): array
    {
        return [
            StockMovement::SOURCE_DIARY_ENTRY,
            StockMovement::SOURCE_PRODUCTION_OUTPUT,
            StockMovement::SOURCE_PRODUCTION_ARTICLE,
            StockMovement::SOURCE_PRODUCTION_RECIPE,
        ];
    }

    public static function of(string $type, string $sourceKind): self
    {
        if (StockMovement::TYPE_COUNT === $type) {
            return self::OBSERVATION;
        }

        if (in_array(needle: $sourceKind, haystack: self::inferredSources(), strict: true)) {
            return self::INFERENCE;
        }

        return self::RECEIPT;
    }

    public function anchorsConfidence(): bool
    {
        return self::OBSERVATION === $this;
    }

    public function blursQuantity(): bool
    {
        return self::INFERENCE === $this;
    }
}
