<?php

namespace App\Tests\Notification\Notification\Inbox\Application\Command;

use Notification\Notification\Inbox\Application\Command\DismissNotificationCommand;
use Notification\Notification\Inbox\Application\Command\DismissNotificationCommandHandler;
use Notification\Notification\Inbox\Domain\Event\NotificationDismissed;
use Notification\Notification\Inbox\Domain\Exception\DismissNotificationException;
use Notification\Notification\Inbox\Domain\Model\Notification;
use Notification\Notification\Inbox\Infrastructure\Domain\Model\InMemory\InMemoryNotificationRepository;
use Notification\Notification\Inbox\Infrastructure\Domain\QueryModel\InMemory\InMemoryDeliverNotificationNeedleDataQuery;
use Notification\Notification\Inbox\Infrastructure\Domain\QueryModel\InMemory\InMemoryGetNotificationInboxNeedleDataQuery;
use Notification\Notification\Settings\Domain\Model\NotificationType;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DismissNotificationCommandHandlerTest extends TestCase
{
    private InMemoryNotificationRepository $repository;
    private DismissNotificationCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryNotificationRepository();
        $this->handler = new DismissNotificationCommandHandler(
            notificationRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItHidesTheNotificationFromTheInboxAndTheUnreadCount(): void
    {
        $notification = $this->delivered();
        $inbox = new InMemoryGetNotificationInboxNeedleDataQuery(repository: $this->repository);

        ($this->handler)(new DismissNotificationCommand(notificationId: $notification->id, dismissedByUserId: 'user-1'));

        $this->assertSame(expected: [], actual: $inbox->findPage(userId: 'user-1', pageNumber: 1, pageSize: 20)->items);
        $this->assertSame(expected: 0, actual: $inbox->countUnread(userId: 'user-1'));
    }

    public function testItKeepsTheDedupeKeySoTheReminderIsNotDeliveredAgain(): void
    {
        $notification = $this->delivered();

        ($this->handler)(new DismissNotificationCommand(notificationId: $notification->id, dismissedByUserId: 'user-1'));

        $this->assertTrue(condition: (new InMemoryDeliverNotificationNeedleDataQuery(repository: $this->repository))->isDelivered(dedupeKey: 'user-1:dentist'));
    }

    public function testItRecordsAHydratedDismissedEvent(): void
    {
        $notification = $this->delivered();
        $notification->pullDomainEvents();

        ($this->handler)(new DismissNotificationCommand(notificationId: $notification->id, dismissedByUserId: 'user-1'));

        $events = $notification->pullDomainEvents();

        $this->assertCount(expectedCount: 1, haystack: $events);
        $this->assertInstanceOf(expected: NotificationDismissed::class, actual: $events[0]);
        $this->assertSame(expected: 'Dentista', actual: $events[0]->title);
        $this->assertNotNull(actual: $events[0]->dismissedAt);
    }

    public function testItRejectsTheNotificationOfAnotherUser(): void
    {
        $notification = $this->delivered();

        $this->expectException(exception: DismissNotificationException::class);

        ($this->handler)(new DismissNotificationCommand(notificationId: $notification->id, dismissedByUserId: 'user-2'));
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
