<?php

namespace Authorization\User\User\Infrastructure\Domain\Service\InMemory;

use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\Service\PasswordHasher;

final class InMemoryPasswordHasher implements PasswordHasher
{
    public function hash(User $user, string $plainPassword): string
    {
        return 'hashed_'.$plainPassword;
    }

    public function isPasswordValid(User $user, string $plainPassword): bool
    {
        return $user->password === 'hashed_'.$plainPassword;
    }
}
