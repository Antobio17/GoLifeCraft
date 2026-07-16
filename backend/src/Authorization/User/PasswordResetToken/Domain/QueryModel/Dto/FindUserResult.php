<?php

namespace Authorization\User\PasswordResetToken\Domain\QueryModel\Dto;

final readonly class FindUserResult
{
    public function __construct(
        public string $id,
        public string $username,
        public string $email,
        public string $name,
    ) {
    }
}
