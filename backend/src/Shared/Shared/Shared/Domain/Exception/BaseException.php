<?php

namespace Shared\Shared\Shared\Domain\Exception;

class BaseException extends \Exception
{
    public function __construct(
        public readonly string $title,
        public readonly string $keyTranslation,
        public readonly array $details = [],
    ) {
        parent::__construct(message: $title);
    }
}
