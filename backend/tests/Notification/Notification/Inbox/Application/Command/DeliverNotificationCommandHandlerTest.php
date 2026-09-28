<?php

namespace App\Tests\Notification\Notification\Inbox\Application\Command;

use Notification\Notification\Inbox\Application\Command\DeliverNotificationCommand;
use Notification\Notification\Inbox\Application\Command\DeliverNotificationCommandHandler;
use Notification\Notification\Inbox\Domain\Event\NotificationDelivered;
use Notification\Notification\Inbox\Infrastructure\Domain\Model\InMemory\InMemoryNotificationRepository;
use Notification\Notification\Inbox\Infrastructure\Domain\QueryModel\InMemory\InMemoryDeliverNotificationNeedleDataQuery;
use Notification\Notification\Inbox\Infrastructure\Domain\Service\Fake\FakeNotificationRenderer;
use Notification\Notification\Settings\Domain\Model\NotificationSettings;
use Notification\Notification\Settings\Domain\Model\NotificationType;
use Notification\Notification\Settings\Infrastructure\Domain\Model\InMemory\InMemoryNotificationSettingsRepository;
use Notification\Notification\Settings\Infrastructure\Domain\QueryModel\InMemory\InMemoryNotificationSettingsNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeliverNotificationCommandHandlerTest extends TestCase
{
    private InMemoryNotificationRepository $repository;
    private InMemoryNotificationSettingsRepository $settingsRepository;
    private DomainEventCollectorService $domainEventCollectorService;
    private DeliverNotificationCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryNotificationRepository();
        $this->settingsRepository = new InMemoryNotificationSettingsRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new DeliverNotificationCommandHandler(
            notificationRepository: $this->repository,
            needleDataQuery: new InMemoryDeliverNotificationNeedleDataQuery(repository: $this->repository),
            settingsNeedleDataQuery: new InMemoryNotificationSettingsNeedleDataQuery(repository: $this->settingsRepository),
            notificationRenderer: new FakeNotificationRenderer(),
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItDeliversTheNotificationRenderedInTheUserLanguage(): void
    {
        $this->settingsRepository->save(notificationSettings: NotificationSettings::create(
            id: NotificationSettings::SINGLETON_ID,
            userId: 'user-1',
            timezone: 'Europe/Madrid',
            languageCode: 'en',
            quietHoursEnabled: false,
            quietHoursStart: '23:00',
            quietHoursEnd: '08:00',
            preferences: [],
            dateTimeGenerator: new DateTimeGenerator(),
        ));

        ($this->handler)($this->command(dedupeKey: 'user-1:dentist'));

        $notifications = $this->repository->all();

        $this->assertCount(expectedCount: 1, haystack: $notifications);
        $this->assertSame(expected: '[en] Dentist', actual: $notifications[0]->title);
        $this->assertSame(expected: NotificationType::AgendaAppointmentDayBefore->value, actual: $notifications[0]->type);
        $this->assertSame(expected: '/agenda?at=2026-09-29', actual: $notifications[0]->url);
        $this->assertTrue(condition: $notifications[0]->pushed);
    }

    public function testItRecordsAHydratedDeliveredEvent(): void
    {
        ($this->handler)($this->command(dedupeKey: 'user-1:dentist'));

        $events = $this->repository->all()[0]->pullDomainEvents();

        $this->assertCount(expectedCount: 1, haystack: $events);
        $this->assertInstanceOf(expected: NotificationDelivered::class, actual: $events[0]);
        $this->assertSame(expected: 'user-1', actual: $events[0]->userId);
        $this->assertSame(expected: 'user-1:dentist', actual: $events[0]->dedupeKey);
        $this->assertSame(expected: '[es] Dentist', actual: $events[0]->title);
    }

    public function testItIgnoresANotificationAlreadyDelivered(): void
    {
        ($this->handler)($this->command(dedupeKey: 'user-1:dentist'));
        ($this->handler)($this->command(dedupeKey: 'user-1:dentist'));

        $this->assertCount(expectedCount: 1, haystack: $this->repository->all());
    }

    private function command(string $dedupeKey): DeliverNotificationCommand
    {
        return new DeliverNotificationCommand(
            userId: 'user-1',
            type: NotificationType::AgendaAppointmentDayBefore->value,
            dedupeKey: $dedupeKey,
            params: ['entryId' => 'dentist', 'title' => 'Dentist', 'date' => '2026-09-29', 'time' => '10:30'],
            url: '/agenda?at=2026-09-29',
            dueAt: new \DateTimeImmutable(datetime: '2026-09-28T18:00:00+00:00'),
        );
    }
}
