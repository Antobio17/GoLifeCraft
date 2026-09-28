<?php

namespace App\Tests\Authorization\User\PushSubscription\Application\Command;

use Authorization\User\PushSubscription\Application\Command\SendPushNotification\SendPushNotificationCommand;
use Authorization\User\PushSubscription\Application\Command\SendPushNotification\SendPushNotificationCommandHandler;
use Authorization\User\PushSubscription\Domain\Event\PushSubscriptionRemoved;
use Authorization\User\PushSubscription\Domain\Model\PushSubscription;
use Authorization\User\PushSubscription\Infrastructure\Domain\Model\InMemory\InMemoryPushSubscriptionRepository;
use PHPUnit\Framework\TestCase;
use Shared\Push\Push\Domain\Exception\SendPushNotificationException;
use Shared\Push\Push\Infrastructure\Domain\Service\Fake\FakePushNotificationSender;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class SendPushNotificationCommandHandlerTest extends TestCase
{
    private InMemoryPushSubscriptionRepository $repository;
    private DomainEventCollectorService $domainEventCollectorService;
    private FakePushNotificationSender $sender;

    protected function setUp(): void
    {
        $this->repository = new InMemoryPushSubscriptionRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->sender = new FakePushNotificationSender();

        $this->subscribe(userId: 'user-1', endpoint: 'https://fcm.googleapis.com/fcm/send/phone');
        $this->subscribe(userId: 'user-1', endpoint: 'https://web.push.apple.com/tablet');
        $this->subscribe(userId: 'user-2', endpoint: 'https://fcm.googleapis.com/fcm/send/other');
    }

    private function subscribe(string $userId, string $endpoint): void
    {
        $subscription = PushSubscription::subscribe(
            id: $this->repository->nextId(),
            userId: $userId,
            endpoint: $endpoint,
            publicKey: 'p256dh-key',
            authToken: 'auth-secret',
            contentEncoding: PushSubscription::CONTENT_ENCODING_AES128GCM,
            userAgent: null,
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $subscription->pullDomainEvents();
        $this->repository->save(pushSubscription: $subscription);
    }

    private function handler(FakePushNotificationSender $sender): SendPushNotificationCommandHandler
    {
        return new SendPushNotificationCommandHandler(
            pushSubscriptionRepository: $this->repository,
            pushNotificationSender: $sender,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItSendsToEveryDeviceOfTheUserAndNoOther(): void
    {
        ($this->handler(sender: $this->sender))(new SendPushNotificationCommand(
            userId: 'user-1',
            title: 'Hola',
            body: 'Cuerpo',
            url: '/diary',
        ));

        $sent = $this->sender->sentNotifications();
        self::assertCount(1, $sent);
        self::assertSame('Hola', $sent[0]['notification']->title);
        self::assertSame('/diary', $sent[0]['notification']->url);
        self::assertSame(
            ['https://fcm.googleapis.com/fcm/send/phone', 'https://web.push.apple.com/tablet'],
            array_map(callback: static fn ($target) => $target->endpoint, array: $sent[0]['targets']),
        );
    }

    public function testItForgetsTheDevicesWhoseSubscriptionExpired(): void
    {
        $this->sender->expire(endpoint: 'https://web.push.apple.com/tablet');

        ($this->handler(sender: $this->sender))(new SendPushNotificationCommand(userId: 'user-1', title: 'Hola', body: 'Cuerpo'));

        $remaining = $this->repository->findByUserId(userId: 'user-1');
        self::assertCount(1, $remaining);
        self::assertSame('https://fcm.googleapis.com/fcm/send/phone', $remaining[0]->endpoint);

        $events = $this->domainEventCollectorService->pullEvents();
        self::assertCount(1, $events);
        self::assertInstanceOf(PushSubscriptionRemoved::class, $events[0]);
        self::assertSame(PushSubscription::REMOVAL_REASON_EXPIRED, $events[0]->reason);
    }

    public function testAUserWithoutDevicesSendsNothing(): void
    {
        ($this->handler(sender: $this->sender))(new SendPushNotificationCommand(userId: 'user-3', title: 'Hola', body: 'Cuerpo'));

        self::assertSame([], $this->sender->sentNotifications());
    }

    public function testItFailsWhenTheServerHasNoVapidKeys(): void
    {
        $this->expectException(SendPushNotificationException::class);

        ($this->handler(sender: new FakePushNotificationSender(vapidPublicKey: null)))(
            new SendPushNotificationCommand(userId: 'user-1', title: 'Hola', body: 'Cuerpo'),
        );
    }
}
