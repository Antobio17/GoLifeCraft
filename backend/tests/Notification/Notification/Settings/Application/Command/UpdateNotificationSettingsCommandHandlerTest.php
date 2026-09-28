<?php

namespace App\Tests\Notification\Notification\Settings\Application\Command;

use Notification\Notification\Settings\Application\Command\UpdateNotificationSettingsCommand;
use Notification\Notification\Settings\Application\Command\UpdateNotificationSettingsCommandHandler;
use Notification\Notification\Settings\Domain\Exception\UpdateNotificationSettingsException;
use Notification\Notification\Settings\Domain\Model\NotificationSettings;
use Notification\Notification\Settings\Domain\Model\NotificationType;
use Notification\Notification\Settings\Infrastructure\Domain\Model\InMemory\InMemoryNotificationSettingsRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateNotificationSettingsCommandHandlerTest extends TestCase
{
    private InMemoryNotificationSettingsRepository $repository;
    private UpdateNotificationSettingsCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryNotificationSettingsRepository();
        $this->handler = new UpdateNotificationSettingsCommandHandler(
            notificationSettingsRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesTheSettingsFillingMissingTypesWithDefaults(): void
    {
        ($this->handler)($this->command(preferences: [
            ['type' => NotificationType::AgendaAppointmentUpcoming->value, 'enabled' => true, 'leadMinutes' => 30],
        ]));

        $settings = $this->repository->findCurrent();

        $this->assertNotNull(actual: $settings);
        $this->assertSame(expected: NotificationSettings::SINGLETON_ID, actual: $settings->id);
        $this->assertSame(expected: 'Atlantic/Canary', actual: $settings->timezone);
        $this->assertSame(expected: 30, actual: $settings->preferences[NotificationType::AgendaAppointmentUpcoming->value]['leadMinutes']);
        $this->assertSame(expected: '20:00', actual: $settings->preferences[NotificationType::AgendaAppointmentDayBefore->value]['time']);
        $this->assertTrue(condition: $settings->preferences[NotificationType::AgendaAppointmentDayBefore->value]['enabled']);
    }

    public function testItUpdatesTheExistingSettings(): void
    {
        ($this->handler)($this->command(preferences: []));
        ($this->handler)($this->command(preferences: [
            ['type' => NotificationType::AgendaAppointmentDayBefore->value, 'enabled' => false, 'time' => '21:30'],
        ]));

        $preference = $this->repository->findCurrent()->snapshot()->preference(type: NotificationType::AgendaAppointmentDayBefore);

        $this->assertFalse(condition: $preference->enabled);
        $this->assertSame(expected: '21:30', actual: $preference->time);
    }

    public function testItRejectsAnUnknownType(): void
    {
        $this->expectException(exception: UpdateNotificationSettingsException::class);

        ($this->handler)($this->command(preferences: [['type' => 'gym.streak', 'enabled' => true]]));
    }

    public function testItRejectsALeadTimeOutsideTheAllowedOptions(): void
    {
        $this->expectException(exception: UpdateNotificationSettingsException::class);

        ($this->handler)($this->command(preferences: [
            ['type' => NotificationType::AgendaAppointmentUpcoming->value, 'enabled' => true, 'leadMinutes' => 45],
        ]));
    }

    public function testItRejectsAnInvalidTimezone(): void
    {
        $this->expectException(exception: UpdateNotificationSettingsException::class);

        ($this->handler)($this->command(preferences: [], timezone: 'Mars/Olympus'));
    }

    /**
     * @param array<int, array<string, mixed>> $preferences
     */
    private function command(array $preferences, string $timezone = 'Atlantic/Canary'): UpdateNotificationSettingsCommand
    {
        return new UpdateNotificationSettingsCommand(
            timezone: $timezone,
            languageCode: 'es',
            quietHoursEnabled: true,
            quietHoursStart: '23:00',
            quietHoursEnd: '07:30',
            preferences: $preferences,
            updatedByUserId: 'user-1',
        );
    }
}
