<?php

namespace Authorization\User\User\Application\Subscriber;

use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\Service\ImpersonationRevoker;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Shared\Tenant\Tenant\Domain\Service\TenantConnectionSwitcher;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

final class ImpersonationSubscriber implements EventSubscriberInterface
{
    private const string HEADER_AUTHORIZATION = 'Authorization';

    public function __construct(
        private readonly TenantConnectionSwitcher $switcher,
        private readonly TokenStorageInterface $tokenStorage,
        private readonly JWTEncoderInterface $jwtEncoder,
        private readonly ImpersonationRevoker $impersonationRevoker,
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

        $user = $token->getUser();
        if (!$user instanceof User || User::ROLE_GOD !== $user->role) {
            return;
        }

        $request = $event->getRequest();
        $payload = $this->decodeToken(request: $request);

        $tenantId = $payload['act_as_tenant_id'] ?? null;
        $impersonatedUserId = $payload['act_as_user_id'] ?? null;
        $tokenId = $payload['jti'] ?? null;
        if (null === $tenantId || null === $impersonatedUserId || null === $tokenId) {
            return;
        }

        if ($this->impersonationRevoker->isRevoked(tokenId: $tokenId)) {
            return;
        }

        $request->attributes->set(key: 'tenantSessionId', value: $tenantId);
        $request->attributes->set(key: 'impersonationTokenId', value: $tokenId);

        $this->switcher->switch(tenantId: $tenantId);
    }

    private function decodeToken(Request $request): array
    {
        $header = $request->headers->get(key: self::HEADER_AUTHORIZATION);
        if (empty($header)) {
            return [];
        }

        $jwt = explode(separator: ' ', string: $header)[1] ?? null;
        if (empty($jwt)) {
            return [];
        }

        try {
            return $this->jwtEncoder->decode(token: $jwt);
        } catch (\Exception) {
            return [];
        }
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', -11],
        ];
    }
}
