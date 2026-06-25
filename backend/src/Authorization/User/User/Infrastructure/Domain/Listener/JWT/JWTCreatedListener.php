<?php

namespace Authorization\User\User\Infrastructure\Domain\Listener\JWT;

use Authorization\User\User\Domain\Model\User;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final class JWTCreatedListener implements EventSubscriberInterface
{
    public function onJWTCreated(JWTCreatedEvent $event): void
    {
        $payload = $event->getData();

        /** @var User */
        $user = $event->getUser();
        $payload['tenant_id'] = $user->tenantId;
        $payload['sub'] = $user->username;
        $payload['email'] = $user->email;
        $payload['user_id'] = $user->id;

        $event->setData(data: $payload);
    }

    public static function getSubscribedEvents(): array
    {
        return [
            'lexik_jwt_authentication.on_jwt_created' => 'onJWTCreated',
        ];
    }
}
