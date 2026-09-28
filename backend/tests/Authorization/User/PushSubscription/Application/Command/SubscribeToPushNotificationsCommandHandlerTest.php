<?php

namespace App\Tests\Authorization\User\PushSubscription\Application\Command;

use Authorization\User\PushSubscription\Application\Command\SubscribeToPushNotifications\SubscribeToPushNotificationsCommand;
use Authorization\User\PushSubscription\Application\Command\SubscribeToPushNotifications\SubscribeToPushNotificationsCommandHandler;
use Authorization\User\PushSubscription\Domain\Event\PushSubscriptionRegistered;
use Authorization\User\PushSubscription\Domain\Event\PushSubscriptionRenewed;
use Authorization\User\PushSubscription\Domain\Exception\SubscribeToPushNotificationsException;
use Authorization\User\PushSubscription\Infrastructure\Domain\Model\InMemory\InMemoryPushSubscriptionRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class SubscribeToPushNotificationsCommandHandlerTest extends TestCase
{
    private const string ENDPOINT = 'https://fcm.googleapis.com/fcm/send/device-1';

    private InMemoryPushSubscriptionRepository $repository;
    private DomainEventCollectorService $domainEventCollectorService;
    private SubscribeToPushNotificationsCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryPushSubscriptionRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new SubscribeToPushNotificationsCommandHandler(
            pushSubscriptionRepository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    private function command(
        string $userSessionId = 'user-1',
        string $endpoint = self::ENDPOINT,
        string $publicKey = 'p256dh-key',
        string $authToken = 'auth-secret',
        string $contentEncoding = 'aes128gcm',
    ): SubscribeToPushNotificationsCommand {
        return new SubscribeToPushNotificationsCommand(
            userSessionId: $userSessionId,
            endpoint: $endpoint,
            publicKey: $publicKey,
            authToken: $authToken,
            contentEncoding: $contentEncoding,
            userAgent: 'Mozilla/5.0 (iPhone)',
        );
    }

    public function testItRegistersANewDevice(): void
    {
        ($this->handler)($this->command());

        $subscriptions = $this->repository->findByUserId(userId: 'user-1');
        self::assertCount(1, $subscriptions);
        self::assertSame(self::ENDPOINT, $subscriptions[0]->endpoint);
        self::assertSame('p256dh-key', $subscriptions[0]->publicKey);
        self::assertSame('Mozilla/5.0 (iPhone)', $subscriptions[0]->userAgent);

        $events = $this->domainEventCollectorService->pullEvents();
        self::assertCount(1, $events);
        self::assertInstanceOf(PushSubscriptionRegistered::class, $events[0]);
        self::assertSame('user-1', $events[0]->userId);
    }

    public function testItRenewsTheSameDeviceInsteadOfDuplicatingIt(): void
    {
        ($this->handler)($this->command());
        $this->domainEventCollectorService->pullEvents();

        ($this->handler)($this->command(publicKey: 'rotated-key', authToken: 'rotated-auth'));

        self::assertCount(1, $this->repository->all());
        self::assertSame('rotated-key', $this->repository->all()[0]->publicKey);
        self::assertSame('rotated-auth', $this->repository->all()[0]->authToken);

        $events = $this->domainEventCollectorService->pullEvents();
        self::assertInstanceOf(PushSubscriptionRenewed::class, $events[0]);
    }

    public function testTheDeviceMovesToTheUserNowSignedInOnIt(): void
    {
        ($this->handler)($this->command(userSessionId: 'user-1'));
        $this->domainEventCollectorService->pullEvents();

        ($this->handler)($this->command(userSessionId: 'user-2'));

        self::assertSame([], $this->repository->findByUserId(userId: 'user-1'));
        self::assertCount(1, $this->repository->findByUserId(userId: 'user-2'));

        $event = $this->domainEventCollectorService->pullEvents()[0];
        self::assertInstanceOf(PushSubscriptionRenewed::class, $event);
        self::assertSame('user-1', $event->previousUserId);
        self::assertSame('user-2', $event->userId);
    }

    public function testItRejectsAnEndpointThatIsNotHttps(): void
    {
        $this->expectException(SubscribeToPushNotificationsException::class);

        ($this->handler)($this->command(endpoint: 'http://push.example.com/device-1'));
    }

    public function testItRejectsASubscriptionWithoutKeys(): void
    {
        $this->expectException(SubscribeToPushNotificationsException::class);

        ($this->handler)($this->command(authToken: ''));
    }

    public function testItRejectsAnUnknownContentEncoding(): void
    {
        $this->expectException(SubscribeToPushNotificationsException::class);

        ($this->handler)($this->command(contentEncoding: 'gzip'));
    }
}
