<?php

namespace Nutrition\Catalog\Article\Domain\Model;

final readonly class ArticlePackaging
{
    private const array MASS_FACTORS = [
        'kg' => 1000.0,
        'kgs' => 1000.0,
        'kilo' => 1000.0,
        'kilos' => 1000.0,
        'kilogramo' => 1000.0,
        'kilogramos' => 1000.0,
        'g' => 1.0,
        'gr' => 1.0,
        'grs' => 1.0,
        'grm' => 1.0,
        'gramo' => 1.0,
        'gramos' => 1.0,
        'mg' => 0.001,
    ];

    private const array VOLUME_FACTORS = [
        'l' => 1000.0,
        'lt' => 1000.0,
        'lts' => 1000.0,
        'litro' => 1000.0,
        'litros' => 1000.0,
        'dl' => 100.0,
        'cl' => 10.0,
        'ml' => 1.0,
        'mililitro' => 1.0,
        'mililitros' => 1.0,
        'cc' => 1.0,
    ];

    private const string MULTIPACK_PATTERN = '/(\d+)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(\p{L}+)/ui';
    private const string MEASURE_PATTERN = '/(\d+(?:[.,]\d+)?)\s*(\p{L}+)/ui';
    private const int MINIMUM_UNITS_PER_PACK = 2;
    private const int SCALE = 2;

    private function __construct(
        public string $baseUnit,
        public ?float $packSize,
        public ?int $unitsPerPack,
    ) {
    }

    public static function unknown(): self
    {
        return new self(baseUnit: Article::BASE_UNIT_GRAM, packSize: null, unitsPerPack: null);
    }

    public static function fromQuantity(?string $quantity): self
    {
        if (null === $quantity || '' === trim($quantity)) {
            return self::unknown();
        }

        $multipack = self::parseMultipack(quantity: $quantity);
        if (null !== $multipack) {
            return $multipack;
        }

        return self::parseMeasure(quantity: $quantity) ?? self::unknown();
    }

    public function packUnit(): ?string
    {
        if (null === $this->packSize) {
            return null;
        }

        return ArticleUnit::PACK->value;
    }

    public function diaryUnit(): string
    {
        if (null === $this->unitSize()) {
            return $this->baseUnit;
        }

        return ArticleUnit::UNIT->value;
    }

    public function unitSize(): ?float
    {
        if (null === $this->packSize || null === $this->unitsPerPack) {
            return null;
        }

        if ($this->unitsPerPack < self::MINIMUM_UNITS_PER_PACK) {
            return null;
        }

        return self::round(value: $this->packSize / $this->unitsPerPack);
    }

    private static function parseMultipack(string $quantity): ?self
    {
        preg_match_all(pattern: self::MULTIPACK_PATTERN, subject: $quantity, matches: $matches, flags: PREG_SET_ORDER);

        foreach ($matches as $match) {
            $measure = self::toMeasure(rawAmount: $match[2], rawUnit: $match[3]);
            $units = (int) $match[1];

            if (null === $measure || $units < 1) {
                continue;
            }

            return new self(
                baseUnit: $measure->baseUnit,
                packSize: self::round(value: (float) $measure->packSize * $units),
                unitsPerPack: $units,
            );
        }

        return null;
    }

    private static function parseMeasure(string $quantity): ?self
    {
        preg_match_all(pattern: self::MEASURE_PATTERN, subject: $quantity, matches: $matches, flags: PREG_SET_ORDER);

        foreach ($matches as $match) {
            $measure = self::toMeasure(rawAmount: $match[1], rawUnit: $match[2]);
            if (null !== $measure) {
                return $measure;
            }
        }

        return null;
    }

    private static function toMeasure(string $rawAmount, string $rawUnit): ?self
    {
        $amount = (float) str_replace(search: ',', replace: '.', subject: $rawAmount);
        if ($amount <= 0.0) {
            return null;
        }

        $unit = mb_strtolower(string: trim($rawUnit));

        if (isset(self::MASS_FACTORS[$unit])) {
            return new self(
                baseUnit: Article::BASE_UNIT_GRAM,
                packSize: self::round(value: $amount * self::MASS_FACTORS[$unit]),
                unitsPerPack: null,
            );
        }

        if (isset(self::VOLUME_FACTORS[$unit])) {
            return new self(
                baseUnit: Article::BASE_UNIT_MILLILITER,
                packSize: self::round(value: $amount * self::VOLUME_FACTORS[$unit]),
                unitsPerPack: null,
            );
        }

        return null;
    }

    private static function round(float $value): float
    {
        return round($value, self::SCALE);
    }
}
