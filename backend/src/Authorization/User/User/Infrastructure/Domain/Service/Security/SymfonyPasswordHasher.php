<?php

namespace Authorization\User\User\Infrastructure\Domain\Service\Security;

use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\Service\PasswordHasher;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class SymfonyPasswordHasher implements PasswordHasher
{
    public function __construct(private readonly UserPasswordHasherInterface $userPasswordHasher)
    {
    }

    public function hash(User $user, string $plainPassword): string
    {
        return $this->userPasswordHasher->hashPassword(user: $user, plainPassword: $plainPassword);
    }

    public function isPasswordValid(User $user, string $plainPassword): bool
    {
        return $this->userPasswordHasher->isPasswordValid(user: $user, plainPassword: $plainPassword);
    }
}
