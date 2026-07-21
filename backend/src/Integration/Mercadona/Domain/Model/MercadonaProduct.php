<?php

namespace Integration\Mercadona\Domain\Model;

final readonly class MercadonaProduct
{
    private const array FRONTAL_PERSPECTIVES = [1, 2, 3];
    private const string LABEL_IMAGE_QUERY = '?fit=crop&w=1280&h=1280';

    /**
     * @param string[] $labelImageUrls
     */
    public function __construct(
        public string $barcode,
        public string $name,
        public ?string $brand,
        public ?string $categoryName,
        public ?string $imageUrl,
        public ?string $quantity,
        public array $labelImageUrls,
    ) {
    }

    public static function fromApiData(array $data): ?self
    {
        $barcode = self::toTrimmedString(value: $data['ean'] ?? null);
        $name = self::toTrimmedString(value: $data['display_name'] ?? null);

        if (null === $barcode || null === $name) {
            return null;
        }

        $photos = is_array($data['photos'] ?? null) ? $data['photos'] : [];

        return new self(
            barcode: $barcode,
            name: $name,
            brand: self::toTrimmedString(value: $data['brand'] ?? null),
            categoryName: self::deepestCategoryName(categories: $data['categories'] ?? null),
            imageUrl: self::frontalImageUrl(photos: $photos),
            quantity: self::quantity(priceInstructions: $data['price_instructions'] ?? null),
            labelImageUrls: self::labelImageUrls(photos: $photos),
        );
    }

    private static function deepestCategoryName(mixed $categories): ?string
    {
        if (!is_array($categories) || !isset($categories[0]) || !is_array($categories[0])) {
            return null;
        }

        $node = $categories[0];
        while (is_array($node['categories'][0] ?? null)) {
            $node = $node['categories'][0];
        }

        return self::toTrimmedString(value: $node['name'] ?? null);
    }

    private static function frontalImageUrl(array $photos): ?string
    {
        foreach ($photos as $photo) {
            if (is_array($photo) && in_array((int) ($photo['perspective'] ?? 0), self::FRONTAL_PERSPECTIVES, true)) {
                return self::toTrimmedString(value: $photo['regular'] ?? null);
            }
        }

        return self::toTrimmedString(value: $photos[0]['regular'] ?? null);
    }

    private static function quantity(mixed $priceInstructions): ?string
    {
        if (!is_array($priceInstructions)) {
            return null;
        }

        $size = $priceInstructions['unit_size'] ?? null;
        $format = self::toTrimmedString(value: $priceInstructions['size_format'] ?? null);

        if (!is_numeric($size) || null === $format) {
            return null;
        }

        return rtrim(rtrim(number_format((float) $size, 3, '.', ''), '0'), '.').' '.strtoupper($format);
    }

    /**
     * @return string[]
     */
    private static function labelImageUrls(array $photos): array
    {
        $labels = [];
        $all = [];

        foreach ($photos as $photo) {
            $url = self::toTrimmedString(value: $photo['zoom'] ?? $photo['regular'] ?? null);
            if (null === $url) {
                continue;
            }

            $ocrUrl = self::ocrUrl(url: $url);
            $all[] = $ocrUrl;

            if (!in_array((int) ($photo['perspective'] ?? 0), self::FRONTAL_PERSPECTIVES, true)) {
                $labels[] = $ocrUrl;
            }
        }

        return [] === $labels ? $all : $labels;
    }

    private static function ocrUrl(string $url): string
    {
        return explode('?', $url, 2)[0].self::LABEL_IMAGE_QUERY;
    }

    private static function toTrimmedString(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return '' === $trimmed ? null : $trimmed;
    }
}
