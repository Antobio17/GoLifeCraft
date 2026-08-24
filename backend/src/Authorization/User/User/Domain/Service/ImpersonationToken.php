<?php

namespace Authorization\User\User\Domain\Service;

use Authorization\User\User\Domain\Model\User;

final readonly class ImpersonationToken
{
    public function __construct(
        public string $token,
        public int $expiresAt,
        public User $impersonator,
        public User $impersonatedUser,
    ) {
    }
}
