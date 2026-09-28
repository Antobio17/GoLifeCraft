<?php

namespace Notification\Notification\Settings\Application\Command;

use Notification\Notification\Settings\Domain\Model\NotificationSettings;
use Notification\Notification\Settings\Domain\Model\NotificationSettingsRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateNotificationSettingsCommandHandler
{
    public function __construct(
        private NotificationSettingsRepository $notificationSettingsRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateNotificationSettingsCommand $command): void
    {
        $settings = $this->notificationSettingsRepository->findCurrent();

        if (null === $settings) {
            $settings = NotificationSettings::create(
                id: NotificationSettings::SINGLETON_ID,
                userId: $command->updatedByUserId,
                timezone: $command->timezone,
                languageCode: $command->languageCode,
                quietHoursEnabled: $command->quietHoursEnabled,
                quietHoursStart: $command->quietHoursStart,
                quietHoursEnd: $command->quietHoursEnd,
                preferences: $command->preferences,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $this->notificationSettingsRepository->save(notificationSettings: $settings);
            $this->domainEventCollectorService->register(aggregate: $settings);

            return;
        }

        $settings->update(
            timezone: $command->timezone,
            languageCode: $command->languageCode,
            quietHoursEnabled: $command->quietHoursEnabled,
            quietHoursStart: $command->quietHoursStart,
            quietHoursEnd: $command->quietHoursEnd,
            preferences: $command->preferences,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->notificationSettingsRepository->save(notificationSettings: $settings);
        $this->domainEventCollectorService->register(aggregate: $settings);
    }
}
