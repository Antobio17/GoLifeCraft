<?php

namespace Nutrition\Catalog\Supermarket\Application\Command;

use Nutrition\Catalog\Supermarket\Domain\Exception\UpdateSupermarketAislesException;
use Nutrition\Catalog\Supermarket\Domain\Model\SupermarketAisle;

final readonly class SupermarketAisleData
{
    public function __construct(
        public ?string $id,
        public string $name,
        public int $position,
    ) {
    }

    /**
     * @param array<int, mixed> $rawAisles
     *
     * @return SupermarketAisleData[]
     */
    public static function listFromArray(array $rawAisles): array
    {
        $aisles = [];

        foreach (array_values($rawAisles) as $index => $rawAisle) {
            if (!is_array($rawAisle)) {
                throw UpdateSupermarketAislesException::aisleNameIsEmpty();
            }

            $aisles[] = self::fromArray(rawAisle: $rawAisle, position: $index + 1);
        }

        return $aisles;
    }

    /**
     * @param array<string, mixed> $rawAisle
     */
    private static function fromArray(array $rawAisle, int $position): self
    {
        $name = trim((string) ($rawAisle['name'] ?? ''));
        if ('' === $name) {
            throw UpdateSupermarketAislesException::aisleNameIsEmpty();
        }

        if (mb_strlen($name) > SupermarketAisle::NAME_MAX_LENGTH) {
            throw UpdateSupermarketAislesException::aisleNameIsTooLong(name: $name);
        }

        $id = isset($rawAisle['id']) ? trim((string) $rawAisle['id']) : '';

        return new self(
            id: '' === $id ? null : $id,
            name: $name,
            position: $position,
        );
    }
}
