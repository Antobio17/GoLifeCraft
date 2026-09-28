<?php

namespace App\Tests\Notification\Notification\Inbox\Application\Query;

use Notification\Notification\Inbox\Application\Command\DeliverNotificationCommand;
use Notification\Notification\Inbox\Application\Command\DeliverNotificationCommandHandler;
use Notification\Notification\Inbox\Application\Query\GetNotificationInboxQuery;
use Notification\Notification\Inbox\Application\Query\GetNotificationInboxQueryHandler;
use Notification\Notification\Inbox\Application\Query\GetUnreadNotificationsCountQuery;
use Notification\Notification\Inbox\Application\Query\GetUnreadNotificationsCountQueryHandler;
use Notification\Notification\Inbox\Domain\QueryModel\Dto\NotificationView;
use Notification\Notification\Inbox\Infrastructure\Domain\Model\InMemory\InMemoryNotificationRepository;
use Notification\Notification\Inbox\Infrastructure\Domain\QueryModel\InMemory\InMemoryDeliverNotificationNeedleDataQuery;
use Notification\Notification\Inbox\Infrastructure\Domain\QueryModel\InMemory\InMemoryGetNotificationInboxNeedleDataQuery;
use Notification\Notification\Inbox\Infrastructure\Domain\Service\Fake\FakeNotificationRenderer;
use Notification\Notification\Inbox\Infrastructure\UI\API\DataTransform\ApiGetNotificationInboxDataTransform;
use Notification\Notification\Inbox\Infrastructure\UI\API\DataTransform\ApiGetUnreadNotificationsCountDataTransform;
use Notification\Notification\Inbox\Infrastructure\UI\API\DataTransform\NotificationInboxCollectionResult;
use Notification\Notification\Settings\Application\Command\MarkNotificationInboxSeenCommand;
use Notification\Notification\Settings\Application\Command\MarkNotificationInboxSeenCommandHandler;
use Notification\Notification\Settings\Domain\Model\NotificationType;
use Notification\Notification\Settings\Infrastructure\Domain\Model\InMemory\InMemoryNotificationSettingsRepository;
use Notification\Notification\Settings\Infrastructure\Domain\QueryModel\InMemory\InMemoryNotificationSettingsNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class GetNotificationInboxQueryHandlerTest extends TestCase
{
    private InMemoryNotificationRepository $repository;
    private InMemoryNotificationSettingsRepository $settingsRepository;

    protected function setUp(): void
    {
        $this->repository = new InMemoryNotificationRepository();
        $this->settingsRepository = new InMemoryNotificationSettingsRepository();
    }

    public function testItListsTheUserNotificationsAllUnreadUntilTheInboxIsSeen(): void
    {
        $this->deliver(userId: 'user-1', dedupeKey: 'user-1:a');
        $this->deliver(userId: 'user-1', dedupeKey: 'user-1:b');
        $this->deliver(userId: 'user-2', dedupeKey: 'user-2:a');

        $inbox = $this->inbox(userId: 'user-1');

        $this->assertSame(expected: 2, actual: $inbox->total);
        $this->assertSame(expected: ['unreadCount' => 2], actual: $inbox->getQueryMeta());
        $this->assertTrue(condition: array_reduce(
            array: $inbox->items,
            callback: static fn (bool $carry, NotificationView $view): bool => $carry && $view->unread,
            initial: true,
        ));
    }

    public function testSeeingTheInboxResetsTheUnreadCount(): void
    {
        $this->deliver(userId: 'user-1', dedupeKey: 'user-1:a');

        (new MarkNotificationInboxSeenCommandHandler(
            notificationSettingsRepository: $this->settingsRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        ))(new MarkNotificationInboxSeenCommand(seenByUserId: 'user-1'));

        $count = (new GetUnreadNotificationsCountQueryHandler(
            needleDataQuery: new InMemoryGetNotificationInboxNeedleDataQuery(repository: $this->repository),
            settingsNeedleDataQuery: new InMemoryNotificationSettingsNeedleDataQuery(repository: $this->settingsRepository),
            dataTransform: new ApiGetUnreadNotificationsCountDataTransform(),
        ))(new GetUnreadNotificationsCountQuery(userSessionId: 'user-1'));

        $this->assertInstanceOf(expected: QuerySingleResult::class, actual: $count);
        $this->assertSame(expected: 0, actual: $count->item->count);
        $this->assertFalse(condition: $this->inbox(userId: 'user-1')->items[0]->unread);
    }

    private function inbox(string $userId): NotificationInboxCollectionResult
    {
        return (new GetNotificationInboxQueryHandler(
            needleDataQuery: new InMemoryGetNotificationInboxNeedleDataQuery(repository: $this->repository),
            settingsNeedleDataQuery: new InMemoryNotificationSettingsNeedleDataQuery(repository: $this->settingsRepository),
            dataTransform: new ApiGetNotificationInboxDataTransform(),
        ))(new GetNotificationInboxQuery(userSessionId: $userId, pageNumber: 1, pageSize: 20));
    }

    private function deliver(string $userId, string $dedupeKey): void
    {
        (new DeliverNotificationCommandHandler(
            notificationRepository: $this->repository,
            needleDataQuery: new InMemoryDeliverNotificationNeedleDataQuery(repository: $this->repository),
            settingsNeedleDataQuery: new InMemoryNotificationSettingsNeedleDataQuery(repository: $this->settingsRepository),
            notificationRenderer: new FakeNotificationRenderer(),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        ))(new DeliverNotificationCommand(
            userId: $userId,
            type: NotificationType::AgendaAppointmentUpcoming->value,
            dedupeKey: $dedupeKey,
            params: ['title' => 'Fisio', 'time' => '18:00', 'minutes' => 40],
            url: '/agenda',
            dueAt: new \DateTimeImmutable(datetime: '2026-09-28T15:00:00+00:00'),
        ));
    }
}
