<?php

namespace Notification\Notification\PushSubscription\Application\Command\UnsubscribeFromPushNotifications;

use Notification\Notification\PushSubscription\Domain\Model\PushSubscription;
use Notification\Notification\PushSubscription\Domain\Model\PushSubscriptionRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UnsubscribeFromPushNotificationsCommandHandler
{
    public function __construct(
        private PushSubscriptionRepository $pushSubscriptionRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UnsubscribeFromPushNotificationsCommand $command): void
    {
        $pushSubscription = $this->pushSubscriptionRepository->findByEndpoint(endpoint: $command->endpoint);

        if (null === $pushSubscription || !$pushSubscription->belongsTo(userId: $command->userSessionId)) {
            return;
        }

        $pushSubscription->remove(
            reason: PushSubscription::REMOVAL_REASON_UNSUBSCRIBED,
            removedByUserId: $command->userSessionId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->pushSubscriptionRepository->remove(pushSubscription: $pushSubscription);
        $this->domainEventCollectorService->register(aggregate: $pushSubscription);
    }
}
