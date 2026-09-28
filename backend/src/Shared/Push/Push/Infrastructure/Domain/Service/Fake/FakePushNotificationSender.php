<?php

namespace Shared\Push\Push\Infrastructure\Domain\Service\Fake;

use Shared\Push\Push\Domain\Exception\SendPushNotificationException;
use Shared\Push\Push\Domain\Model\PushDeliveryReport;
use Shared\Push\Push\Domain\Model\PushNotification;
use Shared\Push\Push\Domain\Model\PushTarget;
use Shared\Push\Push\Domain\Service\PushNotificationSender;

final class FakePushNotificationSender implements PushNotificationSender
{
    /** @var array<int, array{notification: PushNotification, targets: PushTarget[]}> */
    private array $sent = [];

    /**
     * @param string[] $expiredEndpoints
     */
    public function __construct(
        private readonly ?string $vapidPublicKey = 'fake-public-key',
        private array $expiredEndpoints = [],
    ) {
    }

    public function isConfigured(): bool
    {
        return null !== $this->vapidPublicKey;
    }

    public function publicKey(): ?string
    {
        return $this->vapidPublicKey;
    }

    public function expire(string $endpoint): void
    {
        $this->expiredEndpoints[] = $endpoint;
    }

    public function send(PushNotification $notification, array $targets): PushDeliveryReport
    {
        if (!$this->isConfigured()) {
            throw SendPushNotificationException::notConfigured();
        }

        $this->sent[] = ['notification' => $notification, 'targets' => $targets];
        $endpoints = array_map(callback: static fn (PushTarget $target): string => $target->endpoint, array: $targets);

        return new PushDeliveryReport(
            deliveredEndpoints: array_values(array: array_diff($endpoints, $this->expiredEndpoints)),
            expiredEndpoints: array_values(array: array_intersect($endpoints, $this->expiredEndpoints)),
        );
    }

    /** @return array<int, array{notification: PushNotification, targets: PushTarget[]}> */
    public function sentNotifications(): array
    {
        return $this->sent;
    }
}
