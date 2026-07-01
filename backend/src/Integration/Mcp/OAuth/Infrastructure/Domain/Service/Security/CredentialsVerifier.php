<?php

namespace Integration\Mcp\OAuth\Infrastructure\Domain\Service\Security;

use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\Model\UserRepository;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final readonly class CredentialsVerifier
{
    public function __construct(
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    public function verify(string $username, string $password): ?User
    {
        $user = $this->userRepository->findByUsername(username: $username);

        if (null === $user) {
            return null;
        }

        if (!$this->passwordHasher->isPasswordValid(user: $user, plainPassword: $password)) {
            return null;
        }

        return $user;
    }
}
