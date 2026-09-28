<?php

namespace Notification\Notification\Inbox\Application\Command;

use Notification\Notification\Inbox\Domain\Model\Notification;
use Notification\Notification\Inbox\Domain\Model\NotificationRepository;
use Notification\Notification\Inbox\Domain\QueryModel\DeliverNotificationNeedleDataQuery;
use Notification\Notification\Inbox\Domain\Service\NotificationRenderer;
use Notification\Notification\Settings\Domain\Model\NotificationType;
use Notification\Notification\Settings\Domain\QueryModel\NotificationSettingsNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeliverNotificationCommandHandler
{
    public function __construct(
        private NotificationRepository $notificationRepository,
        private DeliverNotificationNeedleDataQuery $needleDataQuery,
        private NotificationSettingsNeedleDataQuery $settingsNeedleDataQuery,
        private NotificationRenderer $notificationRenderer,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeliverNotificationCommand $command): void
    {
        if ($this->needleDataQuery->isDelivered(dedupeKey: $command->dedupeKey)) {
            return;
        }

        $type = NotificationType::from(value: $command->type);
        $settings = $this->settingsNeedleDataQuery->current();
        $rendered = $this->notificationRenderer->render(
            type: $type,
            params: $command->params,
            languageCode: $settings->languageCode,
        );

        $notification = Notification::deliver(
            id: $this->notificationRepository->nextId(),
            userId: $command->userId,
            type: $type,
            dedupeKey: $command->dedupeKey,
            params: $command->params,
            title: $rendered->title,
            body: $rendered->body,
            url: $command->url,
            pushed: !$settings->isQuietAt(now: $this->dateTimeGenerator->now()),
            dueAt: \DateTime::createFromImmutable(object: $command->dueAt)->setTimezone(timezone: new \DateTimeZone(timezone: 'UTC')),
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->notificationRepository->save(notification: $notification);
        $this->domainEventCollectorService->register(aggregate: $notification);
    }
}
