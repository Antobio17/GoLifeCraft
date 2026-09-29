<?php

namespace Notification\Notification\Inbox\Application\Subscriber;

use Notification\Notification\Inbox\Application\Command\ChangeNotificationReadStateCommand;
use Notification\Notification\Inbox\Domain\QueryModel\MarkNotificationsReadNeedleDataQuery;
use Notification\Notification\Settings\Domain\Event\NotificationInboxSeen;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class MarkNotificationsReadOnNotificationInboxSeen implements DomainEventSubscriber
{
    public function __construct(
        private MessageBusInterface $messageBus,
        private MarkNotificationsReadNeedleDataQuery $needleDataQuery,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if (!$event instanceof NotificationInboxSeen || null === $event->inboxSeenAt) {
            return;
        }

        foreach ($this->needleDataQuery->unreadDeliveredUntil(userId: $event->userId, until: $event->inboxSeenAt) as $notificationId) {
            $this->messageBus->dispatch(new ChangeNotificationReadStateCommand(
                notificationId: $notificationId,
                read: true,
                updatedByUserId: $event->updatedByUserId,
            ));
        }
    }
}
