<?php

namespace Notification\Notification\PushSubscription\Application\Subscriber;

use Notification\Notification\Inbox\Domain\Event\NotificationDelivered;
use Notification\Notification\PushSubscription\Application\Command\SendPushNotification\SendPushNotificationCommand;
use Shared\Push\Push\Domain\Service\PushNotificationSender;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class SendPushOnNotificationDelivered implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
        private PushNotificationSender $pushNotificationSender,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof NotificationDelivered) {
            return;
        }

        if (!$event->pushed) {
            return;
        }

        if (!$this->pushNotificationSender->isConfigured()) {
            return;
        }

        $this->messageBus->dispatch(new SendPushNotificationCommand(
            userId: $event->userId,
            title: $event->title,
            body: $event->body,
            url: $event->url,
            tag: $event->dedupeKey,
        ));
    }
}
