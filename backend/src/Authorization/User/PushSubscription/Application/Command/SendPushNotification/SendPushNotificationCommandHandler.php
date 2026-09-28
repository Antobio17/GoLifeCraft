<?php

namespace Authorization\User\PushSubscription\Application\Command\SendPushNotification;

use Authorization\User\PushSubscription\Domain\Model\PushSubscription;
use Authorization\User\PushSubscription\Domain\Model\PushSubscriptionRepository;
use Shared\Push\Push\Domain\Model\PushNotification;
use Shared\Push\Push\Domain\Service\PushNotificationSender;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class SendPushNotificationCommandHandler
{
    public function __construct(
        private PushSubscriptionRepository $pushSubscriptionRepository,
        private PushNotificationSender $pushNotificationSender,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(SendPushNotificationCommand $command): void
    {
        $pushSubscriptions = $this->pushSubscriptionRepository->findByUserId(userId: $command->userId);

        if ([] === $pushSubscriptions) {
            return;
        }

        $report = $this->pushNotificationSender->send(
            notification: new PushNotification(
                title: $command->title,
                body: $command->body,
                url: $command->url,
                tag: $command->tag,
            ),
            targets: array_map(
                callback: static fn (PushSubscription $pushSubscription) => $pushSubscription->target(),
                array: $pushSubscriptions,
            ),
        );

        $expiredSubscriptions = array_filter(
            array: $pushSubscriptions,
            callback: static fn (PushSubscription $pushSubscription): bool => $report->isExpired(endpoint: $pushSubscription->endpoint),
        );

        foreach ($expiredSubscriptions as $expiredSubscription) {
            $expiredSubscription->remove(
                reason: PushSubscription::REMOVAL_REASON_EXPIRED,
                removedByUserId: $command->userId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $this->pushSubscriptionRepository->remove(pushSubscription: $expiredSubscription);
            $this->domainEventCollectorService->register(aggregate: $expiredSubscription);
        }
    }
}
