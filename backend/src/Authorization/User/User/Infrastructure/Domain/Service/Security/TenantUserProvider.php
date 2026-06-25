<?php

namespace Authorization\User\User\Infrastructure\Domain\Service\Security;

use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\Model\UserRepository;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

final readonly class TenantUserProvider implements UserProviderInterface
{
    public function __construct(
        private UserRepository $userRepository,
    ) {
    }

    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        $user = $this->userRepository->findByUsername(username: $identifier);

        if (null === $user) {
            throw new UserNotFoundException();
        }

        return $user;
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        // Implement the logic to refresh the user
        // This is a placeholder implementation
        throw new \RuntimeException('Method not implemented.');
    }

    public function supportsClass(string $class): bool
    {
        return User::class === $class;
    }
}
