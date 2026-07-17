<?php

namespace Authorization\User\User\Application\Subscriber;

use Authorization\User\User\Domain\Event\UserAccessGranted;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Shared\Tenant\Tenant\Domain\Service\TenantProvisioner;

final readonly class ProvisionTenantOnUserAccessGranted implements DomainEventSubscriber
{
    public function __construct(
        private TenantProvisioner $tenantProvisioner,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof UserAccessGranted) {
            return;
        }

        $this->tenantProvisioner->provision(tenantId: $event->tenantId);
    }
}
