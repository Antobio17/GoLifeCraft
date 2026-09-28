<?php

namespace App\Tests\Notification\Notification\PushSubscription\Application\Command;

use Notification\Notification\PushSubscription\Application\Command\UnsubscribeFromPushNotifications\UnsubscribeFromPushNotificationsCommand;
use Notification\Notification\PushSubscription\Application\Command\UnsubscribeFromPushNotifications\UnsubscribeFromPushNotificationsCommandHandler;
use Notification\Notification\PushSubscription\Domain\Event\PushSubscriptionRemoved;
use Notification\Notification\PushSubscription\Domain\Model\PushSubscription;
use Notification\Notification\PushSubscription\Infrastructure\Domain\Model\InMemory\InMemoryPushSubscriptionRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UnsubscribeFromPushNotificationsCommandHandlerTest extends TestCase
{
    private const string ENDPOINT = 'https://web.push.apple.com/device-1';

    private InMemoryPushSubscriptionRepository $repository;
    private DomainEventCollectorService $domainEventCollectorService;
    private UnsubscribeFromPushNotificationsCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryPushSubscriptionRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new UnsubscribeFromPushNotificationsCommandHandler(
            pushSubscriptionRepository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $subscription = PushSubscription::subscribe(
            id: $this->repository->nextId(),
            userId: 'user-1',
            endpoint: self::ENDPOINT,
            publicKey: 'p256dh-key',
            authToken: 'auth-secret',
            contentEncoding: PushSubscription::CONTENT_ENCODING_AES128GCM,
            userAgent: null,
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $subscription->pullDomainEvents();
        $this->repository->save(pushSubscription: $subscription);
    }

    public function testItForgetsTheDeviceOfTheUser(): void
    {
        ($this->handler)(new UnsubscribeFromPushNotificationsCommand(userSessionId: 'user-1', endpoint: self::ENDPOINT));

        self::assertSame([], $this->repository->all());

        $events = $this->domainEventCollectorService->pullEvents();
        self::assertCount(1, $events);
        self::assertInstanceOf(PushSubscriptionRemoved::class, $events[0]);
        self::assertSame(PushSubscription::REMOVAL_REASON_UNSUBSCRIBED, $events[0]->reason);
    }

    public function testItLeavesTheDeviceOfAnotherUserAlone(): void
    {
        ($this->handler)(new UnsubscribeFromPushNotificationsCommand(userSessionId: 'user-2', endpoint: self::ENDPOINT));

        self::assertCount(1, $this->repository->all());
        self::assertSame([], $this->domainEventCollectorService->pullEvents());
    }

    public function testAnUnknownDeviceIsANoOp(): void
    {
        ($this->handler)(new UnsubscribeFromPushNotificationsCommand(userSessionId: 'user-1', endpoint: 'https://web.push.apple.com/unknown'));

        self::assertCount(1, $this->repository->all());
    }
}
