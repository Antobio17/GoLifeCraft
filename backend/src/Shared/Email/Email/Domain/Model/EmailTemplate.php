<?php

namespace Shared\Email\Email\Domain\Model;

final readonly class EmailTemplate
{
    public function __construct(
        public string $path,
        public array $context = [],
    ) {
    }
}
