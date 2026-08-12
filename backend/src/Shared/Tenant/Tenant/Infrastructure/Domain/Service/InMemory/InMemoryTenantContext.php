<?php

namespace Shared\Tenant\Tenant\Infrastructure\Domain\Service\InMemory;

use Shared\Tenant\Tenant\Domain\Service\TenantContext;

final class InMemoryTenantContext implements TenantContext
{
    private ?string $tenantId = null;

    public function set(string $tenantId): void
    {
        $this->tenantId = $tenantId;
    }

    public function get(): ?string
    {
        return $this->tenantId;
    }

    public function isResolved(): bool
    {
        return null !== $this->tenantId;
    }
}
