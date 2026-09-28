<?php

namespace App\Tests\Notification\Notification\PushSubscription\Application\Query;

use Notification\Notification\PushSubscription\Application\Query\GetPushNotificationsConfig\GetPushNotificationsConfigQuery;
use Notification\Notification\PushSubscription\Application\Query\GetPushNotificationsConfig\GetPushNotificationsConfigQueryHandler;
use Notification\Notification\PushSubscription\Domain\Model\PushSubscription;
use Notification\Notification\PushSubscription\Domain\QueryModel\Dto\GetPushNotificationsConfigResult;
use Notification\Notification\PushSubscription\Infrastructure\Domain\Model\InMemory\InMemoryPushSubscriptionRepository;
use Notification\Notification\PushSubscription\Infrastructure\Domain\QueryModel\InMemory\InMemoryGetPushNotificationsConfigNeedleDataQuery;
use Notification\Notification\PushSubscription\Infrastructure\UI\API\DataTransform\ApiGetPushNotificationsConfigDataTransform;
use PHPUnit\Framework\TestCase;
use Shared\Push\Push\Infrastructure\Domain\Service\Fake\FakePushNotificationSender;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class GetPushNotificationsConfigQueryHandlerTest extends TestCase
{
    private InMemoryPushSubscriptionRepository $repository;

    protected function setUp(): void
    {
        $this->repository = new InMemoryPushSubscriptionRepository();
        $this->repository->save(pushSubscription: PushSubscription::subscribe(
            id: $this->repository->nextId(),
            userId: 'user-1',
            endpoint: 'https://fcm.googleapis.com/fcm/send/phone',
            publicKey: 'p256dh-key',
            authToken: 'auth-secret',
            contentEncoding: PushSubscription::CONTENT_ENCODING_AES128GCM,
            userAgent: null,
            dateTimeGenerator: new DateTimeGenerator(),
        ));
    }

    private function config(FakePushNotificationSender $sender): GetPushNotificationsConfigResult
    {
        $handler = new GetPushNotificationsConfigQueryHandler(
            needleDataQuery: new InMemoryGetPushNotificationsConfigNeedleDataQuery(repository: $this->repository),
            pushNotificationSender: $sender,
            dataTransform: new ApiGetPushNotificationsConfigDataTransform(),
        );

        return $handler(new GetPushNotificationsConfigQuery(userSessionId: 'user-1'))->item;
    }

    public function testItExposesThePublicKeyAndTheDevicesOfTheUser(): void
    {
        $config = $this->config(sender: new FakePushNotificationSender(vapidPublicKey: 'public-key'));

        self::assertTrue($config->enabled);
        self::assertSame('public-key', $config->vapidPublicKey);
        self::assertSame(1, $config->subscriptions);
    }

    public function testItReportsPushAsDisabledWithoutVapidKeys(): void
    {
        $config = $this->config(sender: new FakePushNotificationSender(vapidPublicKey: null));

        self::assertFalse($config->enabled);
        self::assertNull($config->vapidPublicKey);
    }
}
