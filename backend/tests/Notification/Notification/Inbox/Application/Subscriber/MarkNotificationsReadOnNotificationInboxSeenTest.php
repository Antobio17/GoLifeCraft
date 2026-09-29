<?php

namespace App\Tests\Notification\Notification\Inbox\Application\Subscriber;

use Notification\Notification\Inbox\Application\Command\ChangeNotificationReadStateCommand;
use Notification\Notification\Inbox\Application\Subscriber\MarkNotificationsReadOnNotificationInboxSeen;
use Notification\Notification\Inbox\Domain\Model\Notification;
use Notification\Notification\Inbox\Infrastructure\Domain\Model\InMemory\InMemoryNotificationRepository;
use Notification\Notification\Inbox\Infrastructure\Domain\QueryModel\InMemory\InMemoryMarkNotificationsReadNeedleDataQuery;
use Notification\Notification\Settings\Domain\Event\NotificationInboxSeen;
use Notification\Notification\Settings\Domain\Model\NotificationType;
use PHPUnit\Framework\TestCase;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\MessageBusInterface;

final class MarkNotificationsReadOnNotificationInboxSeenTest extends TestCase
{
    public function testItMarksReadEveryUnreadNotificationDeliveredUntilThen(): void
    {
        $repository = new InMemoryNotificationRepository();
        $unread = $this->deliver(repository: $repository, dedupeKey: 'user-1:dentist', userId: 'user-1');
        $read = $this->deliver(repository: $repository, dedupeKey: 'user-1:lunch', userId: 'user-1');
        $read->changeReadState(read: true, updatedByUserId: 'user-1', dateTimeGenerator: new DateTimeGenerator());
        $this->deliver(repository: $repository, dedupeKey: 'user-2:dentist', userId: 'user-2');
        $bus = $this->bus();

        (new MarkNotificationsReadOnNotificationInboxSeen(
            messageBus: $bus,
            needleDataQuery: new InMemoryMarkNotificationsReadNeedleDataQuery(repository: $repository),
        ))($this->event(inboxSeenAt: new \DateTime(datetime: '+1 minute')));

        $this->assertCount(expectedCount: 1, haystack: $bus->dispatched);
        $this->assertInstanceOf(expected: ChangeNotificationReadStateCommand::class, actual: $bus->dispatched[0]);
        $this->assertSame(expected: $unread->id, actual: $bus->dispatched[0]->notificationId);
        $this->assertTrue(condition: $bus->dispatched[0]->read);
    }

    public function testItLeavesNotificationsDeliveredAfterwardsUnread(): void
    {
        $repository = new InMemoryNotificationRepository();
        $this->deliver(repository: $repository, dedupeKey: 'user-1:dentist', userId: 'user-1');
        $bus = $this->bus();

        (new MarkNotificationsReadOnNotificationInboxSeen(
            messageBus: $bus,
            needleDataQuery: new InMemoryMarkNotificationsReadNeedleDataQuery(repository: $repository),
        ))($this->event(inboxSeenAt: new \DateTime(datetime: '-1 hour')));

        $this->assertSame(expected: [], actual: $bus->dispatched);
    }

    private function deliver(InMemoryNotificationRepository $repository, string $dedupeKey, string $userId): Notification
    {
        $notification = Notification::deliver(
            id: $repository->nextId(),
            userId: $userId,
            type: NotificationType::AgendaAppointmentDayBefore,
            dedupeKey: $dedupeKey,
            params: [],
            title: 'Dentista',
            body: 'Mañana a las 10:30',
            url: null,
            pushed: true,
            dueAt: new \DateTime(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $repository->save(notification: $notification);

        return $notification;
    }

    private function event(\DateTime $inboxSeenAt): NotificationInboxSeen
    {
        return new NotificationInboxSeen(
            aggregateId: 'notification-settings',
            occurredOn: $inboxSeenAt,
            userId: 'user-1',
            timezone: 'Europe/Madrid',
            languageCode: 'es',
            quietHoursEnabled: false,
            quietHoursStart: '23:00',
            quietHoursEnd: '08:00',
            preferences: [],
            inboxSeenAt: $inboxSeenAt,
            createdAt: $inboxSeenAt,
            updatedAt: $inboxSeenAt,
            createdByUserId: 'user-1',
            updatedByUserId: 'user-1',
        );
    }

    private function bus(): MessageBusInterface
    {
        return new class implements MessageBusInterface {
            /** @var object[] */
            public array $dispatched = [];

            public function dispatch(object $message, array $stamps = []): Envelope
            {
                $this->dispatched[] = $message;

                return new Envelope(message: $message);
            }
        };
    }
}
