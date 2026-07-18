<?php

namespace Authorization\User\RefreshToken\Domain\Service;

final readonly class RefreshTokenGrant
{
    public function __construct(
        public string $userId,
        public string $rawToken,
        public ?string $clientId,
    ) {
    }
}
