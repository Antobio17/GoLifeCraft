<?php

namespace Shared\Email\Email\Domain\Model;

final readonly class EmailAddress
{
    public function __construct(
        public string $email,
        public ?string $name = null,
    ) {
        if (!filter_var(value: $email, filter: FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException(message: "Invalid email: {$email}");
        }
    }
}
