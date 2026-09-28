<?php

namespace Notification\Notification\Settings\Application\Command;

use Notification\Notification\Settings\Domain\Model\NotificationSettings;
use Notification\Notification\Settings\Domain\Model\NotificationSettingsRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class MarkNotificationInboxSeenCommandHandler
{
    public function __construct(
        private NotificationSettingsRepository $notificationSettingsRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(MarkNotificationInboxSeenCommand $command): void
    {
        $settings = $this->notificationSettingsRepository->findCurrent()
            ?? NotificationSettings::createDefault(
                id: NotificationSettings::SINGLETON_ID,
                userId: $command->seenByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

        $settings->markInboxSeen(
            seenByUserId: $command->seenByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->notificationSettingsRepository->save(notificationSettings: $settings);
        $this->domainEventCollectorService->register(aggregate: $settings);
    }
}
