<?php

namespace Shared\Shared\Shared\Domain\Service;

final class ImpersonationContext
{
    private ?string $impersonatorUserId = null;

    public function set(string $impersonatorUserId): void
    {
        $this->impersonatorUserId = $impersonatorUserId;
    }

    public function get(): ?string
    {
        return $this->impersonatorUserId;
    }
}
