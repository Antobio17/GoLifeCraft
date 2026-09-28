<?php

namespace Notification\Notification\PushSubscription\Application\Command\SubscribeToPushNotifications;

use Notification\Notification\PushSubscription\Domain\Model\PushSubscription;
use Notification\Notification\PushSubscription\Domain\Model\PushSubscriptionRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class SubscribeToPushNotificationsCommandHandler
{
    public function __construct(
        private PushSubscriptionRepository $pushSubscriptionRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(SubscribeToPushNotificationsCommand $command): void
    {
        $pushSubscription = $this->pushSubscriptionRepository->findByEndpoint(endpoint: $command->endpoint);

        if (null === $pushSubscription) {
            $pushSubscription = PushSubscription::subscribe(
                id: $this->pushSubscriptionRepository->nextId(),
                userId: $command->userSessionId,
                endpoint: $command->endpoint,
                publicKey: $command->publicKey,
                authToken: $command->authToken,
                contentEncoding: $command->contentEncoding,
                userAgent: $command->userAgent,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $this->pushSubscriptionRepository->save(pushSubscription: $pushSubscription);
            $this->domainEventCollectorService->register(aggregate: $pushSubscription);

            return;
        }

        $pushSubscription->renew(
            userId: $command->userSessionId,
            publicKey: $command->publicKey,
            authToken: $command->authToken,
            contentEncoding: $command->contentEncoding,
            userAgent: $command->userAgent,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->pushSubscriptionRepository->save(pushSubscription: $pushSubscription);
        $this->domainEventCollectorService->register(aggregate: $pushSubscription);
    }
}
