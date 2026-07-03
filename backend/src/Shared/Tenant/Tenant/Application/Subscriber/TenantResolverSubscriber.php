<?php

namespace Shared\Tenant\Tenant\Application\Subscriber;

use Authorization\User\User\Domain\Model\User;
use Shared\Shared\Shared\Domain\Exception\BaseException;
use Shared\Tenant\Tenant\Domain\Service\TenantConnectionSwitcher;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

final class TenantResolverSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly TenantConnectionSwitcher $switcher,
        private readonly TokenStorageInterface $tokenStorage,
    ) {
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $token = $this->tokenStorage->getToken();
        if (null === $token) {
            return;
        }

        /** @var User */
        $user = $token->getUser();
        $tenantId = $user?->tenantId;
        if (null === $tenantId) {
            throw new BaseException(
                title: 'Tenant ID not found',
                keyTranslation: 'token.authentication.failed',
                details: []
            );
        }

        $event->getRequest()->attributes->set(key: 'tenantSessionId', value: $tenantId);
        $event->getRequest()->attributes->set(key: 'userSessionId', value: $user->id);
        $event->getRequest()->attributes->set(key: 'userRole', value: $user->role);

        $this->switcher->switch(tenantId: $tenantId);
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', -10],
        ];
    }
}
