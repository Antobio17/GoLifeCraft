<?php

namespace Nutrition\Menu\Menu\Infrastructure\Domain\Service\Dompdf;

use Nutrition\Menu\Menu\Domain\Service\DocumentTheme;

/**
 * Colores del design system aplanados a hexadecimal: dompdf no resuelve
 * custom properties ni color-mix, así que las capas translúcidas de los
 * tokens se precalculan aquí sobre la superficie sobre la que se pintan.
 */
final readonly class MenuDocumentPalette
{
    public function __construct(
        public string $page,
        public string $surface,
        public string $surfaceInset,
        public string $text,
        public string $textBody,
        public string $textMuted,
        public string $textMeta,
        public string $brand,
        public string $brandSoft,
        public string $brandSoftText,
        public string $brandSoftBorder,
        public string $border,
        public string $borderHairline,
        public string $barTrack,
        public string $barFill,
    ) {
    }

    public static function forTheme(DocumentTheme $theme): self
    {
        return DocumentTheme::DARK === $theme ? self::dark() : self::light();
    }

    private static function light(): self
    {
        return new self(
            page: '#ffffff',
            surface: '#ffffff',
            surfaceInset: '#eff2ef',
            text: '#0b1410',
            textBody: '#414742',
            textMuted: '#646b66',
            textMeta: '#89918b',
            brand: '#00863d',
            brandSoft: '#e6fde5',
            brandSoftText: '#086733',
            brandSoftBorder: '#b8dcc9',
            border: '#e4e9e5',
            borderHairline: '#eff2ef',
            barTrack: '#e4e9e5',
            barFill: '#00863d',
        );
    }

    private static function dark(): self
    {
        return new self(
            page: '#000000',
            surface: '#0a100c',
            surfaceInset: '#182019',
            text: '#eef7f0',
            textBody: '#c3cec8',
            textMuted: '#8b968f',
            textMeta: '#6a736d',
            brand: '#8ffa98',
            brandSoft: '#1d3120',
            brandSoftText: '#8ffa98',
            brandSoftBorder: '#325636',
            border: '#252b26',
            borderHairline: '#131915',
            barTrack: '#252b26',
            barFill: '#8ffa98',
        );
    }
}
