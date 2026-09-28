<?php

namespace App\Tests\Notification\Notification\Settings\Application\Command;

use Notification\Notification\Settings\Application\Command\MarkNotificationInboxSeenCommand;
use Notification\Notification\Settings\Application\Command\MarkNotificationInboxSeenCommandHandler;
use Notification\Notification\Settings\Domain\Model\NotificationSettings;
use Notification\Notification\Settings\Infrastructure\Domain\Model\InMemory\InMemoryNotificationSettingsRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class MarkNotificationInboxSeenCommandHandlerTest extends TestCase
{
    public function testItStampsTheInboxAsSeenCreatingDefaultSettingsWhenMissing(): void
    {
        $repository = new InMemoryNotificationSettingsRepository();
        $handler = new MarkNotificationInboxSeenCommandHandler(
            notificationSettingsRepository: $repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );

        ($handler)(new MarkNotificationInboxSeenCommand(seenByUserId: 'user-1'));

        $settings = $repository->findCurrent();

        $this->assertNotNull(actual: $settings);
        $this->assertNotNull(actual: $settings->inboxSeenAt);
        $this->assertSame(expected: NotificationSettings::DEFAULT_TIMEZONE, actual: $settings->timezone);
        $this->assertSame(expected: 'user-1', actual: $settings->updatedByUserId);
    }
}
