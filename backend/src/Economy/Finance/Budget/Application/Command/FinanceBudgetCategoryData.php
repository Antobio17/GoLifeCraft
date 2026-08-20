<?php

namespace Economy\Finance\Budget\Application\Command;

use Economy\Finance\Budget\Domain\Model\FinanceBudgetCategory;

final readonly class FinanceBudgetCategoryData
{
    public function __construct(
        public string $category,
        public string $kind,
        public float $amount,
        public int $position,
    ) {
    }

    /**
     * @param array<string, mixed> $rawCategory
     */
    public static function fromArray(array $rawCategory, int $position): self
    {
        return new self(
            category: (string) ($rawCategory['category'] ?? ''),
            kind: self::normalizeKind(kind: (string) ($rawCategory['kind'] ?? FinanceBudgetCategory::KIND_VARIABLE)),
            amount: (float) ($rawCategory['amount'] ?? 0),
            position: (int) ($rawCategory['position'] ?? $position),
        );
    }

    /**
     * @param array<int, array<string, mixed>> $rawCategories
     *
     * @return self[]
     */
    public static function listFromArray(array $rawCategories): array
    {
        $categories = [];

        foreach (array_values(array: $rawCategories) as $index => $rawCategory) {
            $categories[] = self::fromArray(rawCategory: $rawCategory, position: $index + 1);
        }

        return $categories;
    }

    private static function normalizeKind(string $kind): string
    {
        return FinanceBudgetCategory::KIND_FIXED === $kind
            ? FinanceBudgetCategory::KIND_FIXED
            : FinanceBudgetCategory::KIND_VARIABLE;
    }
}
