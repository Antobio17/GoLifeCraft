<?php

namespace Shared\Tool\Tool\Infrastructure\UI\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

final class LocalizedNumberExtension extends AbstractExtension
{
    /** @var array<string, array{decimal: string, thousands: string}> */
    private const SEPARATORS = [
        'en' => ['decimal' => '.', 'thousands' => ','],
        'es' => ['decimal' => ',', 'thousands' => '.'],
    ];

    private const FALLBACK_LOCALE = 'es';

    /**
     * @return TwigFilter[]
     */
    public function getFilters(): array
    {
        return [
            new TwigFilter(name: 'localized_number', callable: $this->format(...)),
        ];
    }

    public function format(float $value, string $locale, ?int $decimals = null): string
    {
        $separators = self::SEPARATORS[$locale] ?? self::SEPARATORS[self::FALLBACK_LOCALE];

        return number_format(
            num: $value,
            decimals: $decimals ?? ($value == round(num: $value) ? 0 : 1),
            decimal_separator: $separators['decimal'],
            thousands_separator: $separators['thousands'],
        );
    }
}
