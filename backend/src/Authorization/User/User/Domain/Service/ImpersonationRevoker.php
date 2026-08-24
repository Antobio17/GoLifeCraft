<?php

namespace Authorization\User\User\Domain\Service;

interface ImpersonationRevoker
{
    public function revoke(string $tokenId): void;

    public function isRevoked(string $tokenId): bool;
}
