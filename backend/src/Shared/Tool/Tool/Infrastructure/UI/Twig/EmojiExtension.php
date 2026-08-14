<?php

namespace Shared\Tool\Tool\Infrastructure\UI\Twig;

use Shared\Tool\Tool\Domain\Service\EmojiImageResolver;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

final class EmojiExtension extends AbstractExtension
{
    public function __construct(
        private readonly EmojiImageResolver $emojiImageResolver,
    ) {
    }

    /**
     * @return TwigFilter[]
     */
    public function getFilters(): array
    {
        return [
            new TwigFilter(name: 'emoji_src', callable: $this->emojiImageResolver->resolve(...)),
        ];
    }
}
