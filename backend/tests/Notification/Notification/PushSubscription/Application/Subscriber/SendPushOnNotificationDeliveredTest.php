<?php

namespace App\Tests\Notification\Notification\PushSubscription\Application\Subscriber;

use Notification\Notification\Inbox\Domain\Event\NotificationDelivered;
use Notification\Notification\PushSubscription\Application\Command\SendPushNotification\SendPushNotificationCommand;
use Notification\Notification\PushSubscription\Application\Subscriber\SendPushOnNotificationDelivered;
use PHPUnit\Framework\TestCase;
use Shared\Push\Push\Infrastructure\Domain\Service\Fake\FakePushNotificationSender;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\MessageBusInterface;

final class SendPushOnNotificationDeliveredTest extends TestCase
{
    public function testItPushesADeliveredNotification(): void
    {
        $bus = $this->bus();

        (new SendPushOnNotificationDelivered(messageBus: $bus, pushNotificationSender: new FakePushNotificationSender()))(
            $this->event(pushed: true),
        );

        $this->assertCount(expectedCount: 1, haystack: $bus->dispatched);
        $this->assertInstanceOf(expected: SendPushNotificationCommand::class, actual: $bus->dispatched[0]);
        $this->assertSame(expected: 'user-1:dentist', actual: $bus->dispatched[0]->tag);
        $this->assertSame(expected: 'Mañana: Dentista', actual: $bus->dispatched[0]->title);
    }

    public function testItKeepsQuietNotificationsInTheInboxOnly(): void
    {
        $bus = $this->bus();

        (new SendPushOnNotificationDelivered(messageBus: $bus, pushNotificationSender: new FakePushNotificationSender()))(
            $this->event(pushed: false),
        );

        $this->assertSame(expected: [], actual: $bus->dispatched);
    }

    private function event(bool $pushed): NotificationDelivered
    {
        $now = new \DateTime();

        return new NotificationDelivered(
            aggregateId: 'notification-1',
            occurredOn: $now,
            userId: 'user-1',
            type: 'agenda.appointment.dayBefore',
            dedupeKey: 'user-1:dentist',
            params: ['title' => 'Dentista'],
            title: 'Mañana: Dentista',
            body: 'Tienes una cita mañana a las 10:30.',
            url: '/agenda?at=2026-09-29',
            pushed: $pushed,
            dueAt: $now,
            deliveredAt: $now,
            readAt: null,
            dismissedAt: null,
            createdAt: $now,
            updatedAt: $now,
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
