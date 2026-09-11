<?php

namespace Shared\Tenant\Tenant\Domain\Service;

interface TenantProvisioner
{
    public function provision(string $tenantId): void;
}
