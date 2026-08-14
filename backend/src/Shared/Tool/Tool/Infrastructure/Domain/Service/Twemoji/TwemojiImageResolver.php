<?php

namespace Shared\Tool\Tool\Infrastructure\Domain\Service\Twemoji;

use Shared\Tool\Tool\Domain\Service\EmojiImageResolver;

/**
 * PDF renderers cannot draw emoji from a font: dompdf drops every codepoint above U+FFFF, which
 * is where emoji live. Each emoji is resolved to its Twemoji artwork and inlined as an image.
 */
final class TwemojiImageResolver implements EmojiImageResolver
{
    private const VARIATION_SELECTOR = 0xFE0F;

    /** @var array<string, ?string> */
    private array $cache = [];

    public function __construct(
        private readonly string $assetDirectory,
    ) {
    }

    public function resolve(string $emoji): ?string
    {
        if ('' === $emoji) {
            return null;
        }

        if (!array_key_exists(key: $emoji, array: $this->cache)) {
            $this->cache[$emoji] = $this->readArtwork(emoji: $emoji);
        }

        return $this->cache[$emoji];
    }

    private function readArtwork(string $emoji): ?string
    {
        $codePoints = $this->codePoints(emoji: $emoji);
        if ([] === $codePoints) {
            return null;
        }

        foreach ($this->candidates(codePoints: $codePoints) as $candidate) {
            $path = $this->assetDirectory.'/'.$candidate.'.svg';
            if (!is_readable(filename: $path)) {
                continue;
            }

            return 'data:image/svg+xml;base64,'.base64_encode(string: (string) file_get_contents(filename: $path));
        }

        return null;
    }

    /**
     * @param array<int, int> $codePoints
     *
     * @return array<int, string>
     */
    private function candidates(array $codePoints): array
    {
        $withoutSelectors = array_values(array: array_filter(
            array: $codePoints,
            callback: static fn (int $codePoint): bool => self::VARIATION_SELECTOR !== $codePoint,
        ));

        $names = [
            $this->fileName(codePoints: $codePoints),
            $this->fileName(codePoints: $withoutSelectors),
            $this->fileName(codePoints: [$codePoints[0]]),
        ];

        return array_values(array: array_unique(array: array_filter(array: $names)));
    }

    /**
     * @param array<int, int> $codePoints
     */
    private function fileName(array $codePoints): string
    {
        return implode(separator: '-', array: array_map(
            callback: static fn (int $codePoint): string => dechex(num: $codePoint),
            array: $codePoints,
        ));
    }

    /**
     * @return array<int, int>
     */
    private function codePoints(string $emoji): array
    {
        $utf32 = mb_convert_encoding(string: $emoji, to_encoding: 'UTF-32BE', from_encoding: 'UTF-8');
        if (false === $utf32) {
            return [];
        }

        return array_values(array: (array) unpack(format: 'N*', string: $utf32));
    }
}
