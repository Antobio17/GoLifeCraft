<?php

namespace Nutrition\Catalog\Article\Application\Command;

final readonly class ArticleEquivalenceData
{
    public function __construct(
        public string $unit,
        public float $quantity,
        public int $position,
    ) {
    }

    public static function fromArray(array $rawEquivalence, int $position): self
    {
        return new self(
            unit: trim(string: (string) ($rawEquivalence['unit'] ?? '')),
            quantity: (float) ($rawEquivalence['quantity'] ?? $rawEquivalence['qty'] ?? 0),
            position: (int) ($rawEquivalence['position'] ?? $position),
        );
    }

    /**
     * @return self[]
     */
    public static function listFromArray(array $rawEquivalences): array
    {
        $equivalences = [];

        foreach (array_values(array: $rawEquivalences) as $index => $rawEquivalence) {
            $equivalence = self::fromArray(rawEquivalence: $rawEquivalence, position: $index + 1);

            if ('' === $equivalence->unit || $equivalence->quantity <= 0) {
                continue;
            }

            $equivalences[] = $equivalence;
        }

        return $equivalences;
    }
}
