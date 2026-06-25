<?php

namespace Authorization\User\User\Domain\Service;

use Authorization\User\User\Domain\Model\User;

interface PasswordHasher
{
    public function hash(User $user, string $plainPassword): string;

    public function isPasswordValid(User $user, string $plainPassword): bool;
}
