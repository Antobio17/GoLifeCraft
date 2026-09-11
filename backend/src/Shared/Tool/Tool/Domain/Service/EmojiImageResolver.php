<?php

namespace Shared\Tool\Tool\Domain\Service;

interface EmojiImageResolver
{
    public function resolve(string $emoji): ?string;
}
