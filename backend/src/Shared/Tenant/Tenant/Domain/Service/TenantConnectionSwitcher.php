<?php

namespace Shared\Tenant\Tenant\Domain\Service;

interface TenantConnectionSwitcher
{
    public function switch(string $tenantId): void;
}
