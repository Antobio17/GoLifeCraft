<?php

namespace App\Tests\Notification\Notification\Inbox\Application\Command;

use Notification\Notification\Inbox\Application\Command\ChangeNotificationReadStateCommand;
use Notification\Notification\Inbox\Application\Command\ChangeNotificationReadStateCommandHandler;
use Notification\Notification\Inbox\Domain\Event\NotificationReadStateChanged;
use Notification\Notification\Inbox\Domain\Exception\ChangeNotificationReadStateException;
use Notification\Notification\Inbox\Domain\Model\Notification;
use Notification\Notification\Inbox\Infrastructure\Domain\Model\InMemory\InMemoryNotificationRepository;
use Notification\Notification\Settings\Domain\Model\NotificationType;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ChangeNotificationReadStateCommandHandlerTest extends TestCase
{
    private InMemoryNotificationRepository $repository;
    private ChangeNotificationReadStateCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryNotificationRepository();
        $this->handler = new ChangeNotificationReadStateCommandHandler(
            notificationRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItMarksANotificationAsRead(): void
    {
        $notification = $this->delivered();

        ($this->handler)(new ChangeNotificationReadStateCommand(notificationId: $notification->id, read: true, updatedByUserId: 'user-1'));

        $this->assertNotNull(actual: $this->repository->findById(id: $notification->id)->readAt);
    }

    public function testItMarksANotificationAsUnreadAgain(): void
    {
        $notification = $this->delivered();

        ($this->handler)(new ChangeNotificationReadStateCommand(notificationId: $notification->id, read: true, updatedByUserId: 'user-1'));
        ($this->handler)(new ChangeNotificationReadStateCommand(notificationId: $notification->id, read: false, updatedByUserId: 'user-1'));

        $this->assertNull(actual: $this->repository->findById(id: $notification->id)->readAt);
    }

    public function testItRecordsAHydratedEventOnlyWhenTheStateChanges(): void
    {
        $notification = $this->delivered();
        $notification->pullDomainEvents();

        ($this->handler)(new ChangeNotificationReadStateCommand(notificationId: $notification->id, read: true, updatedByUserId: 'user-1'));
        ($this->handler)(new ChangeNotificationReadStateCommand(notificationId: $notification->id, read: true, updatedByUserId: 'user-1'));

        $events = $notification->pullDomainEvents();

        $this->assertCount(expectedCount: 1, haystack: $events);
        $this->assertInstanceOf(expected: NotificationReadStateChanged::class, actual: $events[0]);
        $this->assertSame(expected: 'user-1:dentist', actual: $events[0]->dedupeKey);
        $this->assertNotNull(actual: $events[0]->readAt);
    }

    public function testItRejectsTheNotificationOfAnotherUser(): void
    {
        $notification = $this->delivered();

        $this->expectException(exception: ChangeNotificationReadStateException::class);

        ($this->handler)(new ChangeNotificationReadStateCommand(notificationId: $notification->id, read: true, updatedByUserId: 'user-2'));
    }

    public function testItRejectsAnUnknownNotification(): void
    {
        $this->expectException(exception: ChangeNotificationReadStateException::class);

        ($this->handler)(new ChangeNotificationReadStateCommand(notificationId: 'missing', read: true, updatedByUserId: 'user-1'));
    }

    private function delivered(): Notification
    {
        $notification = Notification::deliver(
            id: $this->repository->nextId(),
            userId: 'user-1',
            type: NotificationType::AgendaAppointmentDayBefore,
            dedupeKey: 'user-1:dentist',
            params: [],
            title: 'Dentista',
            body: 'Mañana a las 10:30',
            url: null,
            pushed: true,
            dueAt: new \DateTime(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $this->repository->save(notification: $notification);

        return $notification;
    }
}
