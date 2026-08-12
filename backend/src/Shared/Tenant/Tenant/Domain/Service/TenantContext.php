<?php

namespace Shared\Tenant\Tenant\Domain\Service;

interface TenantContext
{
    public function set(string $tenantId): void;

    public function get(): ?string;

    public function isResolved(): bool;
}
