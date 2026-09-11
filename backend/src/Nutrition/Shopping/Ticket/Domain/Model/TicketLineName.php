<?php

namespace Nutrition\Shopping\Ticket\Domain\Model;

final readonly class TicketLineName
{
    private const array ACCENTS = [
        'á' => 'a', 'à' => 'a', 'ä' => 'a', 'â' => 'a', 'ã' => 'a', 'å' => 'a',
        'é' => 'e', 'è' => 'e', 'ë' => 'e', 'ê' => 'e',
        'í' => 'i', 'ì' => 'i', 'ï' => 'i', 'î' => 'i',
        'ó' => 'o', 'ò' => 'o', 'ö' => 'o', 'ô' => 'o', 'õ' => 'o',
        'ú' => 'u', 'ù' => 'u', 'ü' => 'u', 'û' => 'u',
        'ñ' => 'n', 'ç' => 'c',
    ];

    public const int MAX_LENGTH = 255;

    private function __construct(
        public string $raw,
        public string $normalized,
    ) {
    }

    public static function of(string $raw): self
    {
        return new self(raw: trim(string: $raw), normalized: self::normalize(value: $raw));
    }

    public static function normalize(string $value): string
    {
        $lowered = strtr(string: mb_strtolower(string: trim(string: $value)), from: self::ACCENTS);

        return (string) preg_replace(pattern: '/[^a-z0-9]+/', replacement: '', subject: $lowered);
    }

    /**
     * @return array<int, string>
     */
    public static function tokenize(string $value): array
    {
        $lowered = strtr(string: mb_strtolower(string: trim(string: $value)), from: self::ACCENTS);
        $cleaned = (string) preg_replace(pattern: '/[^a-z0-9]+/', replacement: ' ', subject: $lowered);

        return array_values(array: array_filter(
            array: explode(separator: ' ', string: trim(string: $cleaned)),
            callback: static fn (string $token): bool => '' !== $token,
        ));
    }
}
