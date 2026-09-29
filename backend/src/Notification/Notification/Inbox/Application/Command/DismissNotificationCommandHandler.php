<?php

namespace Notification\Notification\Inbox\Application\Command;

use Notification\Notification\Inbox\Domain\Exception\DismissNotificationException;
use Notification\Notification\Inbox\Domain\Model\NotificationRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DismissNotificationCommandHandler
{
    public function __construct(
        private NotificationRepository $notificationRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DismissNotificationCommand $command): void
    {
        $notification = $this->notificationRepository->findById(id: $command->notificationId);

        if (null === $notification || $notification->userId !== $command->dismissedByUserId) {
            throw DismissNotificationException::notFound(notificationId: $command->notificationId);
        }

        $notification->dismiss(
            dismissedByUserId: $command->dismissedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->notificationRepository->save(notification: $notification);
        $this->domainEventCollectorService->register(aggregate: $notification);
    }
}
