<?php

namespace Notification\Notification\Inbox\Application\Command;

use Notification\Notification\Inbox\Domain\Exception\ChangeNotificationReadStateException;
use Notification\Notification\Inbox\Domain\Model\NotificationRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ChangeNotificationReadStateCommandHandler
{
    public function __construct(
        private NotificationRepository $notificationRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ChangeNotificationReadStateCommand $command): void
    {
        $notification = $this->notificationRepository->findById(id: $command->notificationId);

        if (null === $notification || $notification->userId !== $command->updatedByUserId) {
            throw ChangeNotificationReadStateException::notFound(notificationId: $command->notificationId);
        }

        $notification->changeReadState(
            read: $command->read,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->notificationRepository->save(notification: $notification);
        $this->domainEventCollectorService->register(aggregate: $notification);
    }
}
