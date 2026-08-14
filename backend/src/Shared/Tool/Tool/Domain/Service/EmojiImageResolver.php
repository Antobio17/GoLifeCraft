<?php

namespace Shared\Tool\Tool\Domain\Service;

interface EmojiImageResolver
{
    /**
     * Inline image source for the given emoji, or null when there is no artwork for it.
     */
    public function resolve(string $emoji): ?string;
}
