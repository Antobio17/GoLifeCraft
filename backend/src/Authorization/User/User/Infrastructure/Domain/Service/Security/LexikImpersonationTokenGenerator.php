<?php

namespace Authorization\User\User\Infrastructure\Domain\Service\Security;

use Authorization\User\User\Domain\Exception\ImpersonateUserException;
use Authorization\User\User\Domain\Model\UserRepository;
use Authorization\User\User\Domain\Service\ImpersonationToken;
use Authorization\User\User\Domain\Service\ImpersonationTokenGenerator;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class LexikImpersonationTokenGenerator implements ImpersonationTokenGenerator
{
    public function __construct(
        private UserRepository $userRepository,
        private JWTTokenManagerInterface $jwtManager,
        private DateTimeGenerator $dateTimeGenerator,
        private int $ttlSeconds,
    ) {
    }

    public function generate(string $impersonatorUserId, string $impersonatedUserId): ImpersonationToken
    {
        $impersonator = $this->userRepository->findById(id: $impersonatorUserId);
        if (null === $impersonator) {
            throw ImpersonateUserException::userNotFound(userId: $impersonatorUserId);
        }

        $impersonatedUser = $this->userRepository->findById(id: $impersonatedUserId);
        if (null === $impersonatedUser) {
            throw ImpersonateUserException::userNotFound(userId: $impersonatedUserId);
        }

        $expiresAt = $this->dateTimeGenerator->now()->getTimestamp() + $this->ttlSeconds;

        return new ImpersonationToken(
            token: $this->jwtManager->createFromPayload(user: $impersonator, payload: [
                'jti' => bin2hex(string: random_bytes(length: 16)),
                'act_as_tenant_id' => $impersonatedUser->tenantId,
                'act_as_user_id' => $impersonatedUser->id,
                'impersonator_user_id' => $impersonator->id,
                'exp' => $expiresAt,
            ]),
            expiresAt: $expiresAt,
            impersonator: $impersonator,
            impersonatedUser: $impersonatedUser,
        );
    }
}
