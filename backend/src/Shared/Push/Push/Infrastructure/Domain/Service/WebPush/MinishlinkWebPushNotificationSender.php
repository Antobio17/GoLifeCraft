<?php

namespace Shared\Push\Push\Infrastructure\Domain\Service\WebPush;

use Minishlink\WebPush\MessageSentReport;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;
use Psr\Log\LoggerInterface;
use Shared\Push\Push\Domain\Exception\SendPushNotificationException;
use Shared\Push\Push\Domain\Model\PushDeliveryReport;
use Shared\Push\Push\Domain\Model\PushNotification;
use Shared\Push\Push\Domain\Service\PushNotificationSender;

final readonly class MinishlinkWebPushNotificationSender implements PushNotificationSender
{
    private const int TIME_TO_LIVE_SECONDS = 86400;

    public function __construct(
        private string $vapidPublicKey,
        private string $vapidPrivateKey,
        private string $vapidSubject,
        private LoggerInterface $logger,
    ) {
    }

    public function isConfigured(): bool
    {
        return '' !== $this->vapidPublicKey && '' !== $this->vapidPrivateKey && '' !== $this->vapidSubject;
    }

    public function publicKey(): ?string
    {
        return $this->isConfigured() ? $this->vapidPublicKey : null;
    }

    public function send(PushNotification $notification, array $targets): PushDeliveryReport
    {
        if (!$this->isConfigured()) {
            throw SendPushNotificationException::notConfigured();
        }

        $webPush = new WebPush(
            auth: [
                'VAPID' => [
                    'subject' => $this->vapidSubject,
                    'publicKey' => $this->vapidPublicKey,
                    'privateKey' => $this->vapidPrivateKey,
                ],
            ],
            defaultOptions: ['TTL' => self::TIME_TO_LIVE_SECONDS],
            logger: $this->logger,
        );

        $payload = json_encode(value: $notification->toPayload(), flags: JSON_THROW_ON_ERROR);

        foreach ($targets as $target) {
            $webPush->queueNotification(
                subscription: new Subscription(
                    endpoint: $target->endpoint,
                    publicKey: $target->publicKey,
                    authToken: $target->authToken,
                    contentEncoding: $target->contentEncoding,
                ),
                payload: $payload,
            );
        }

        return $this->collect(reports: $webPush->flush());
    }

    /**
     * @param iterable<MessageSentReport> $reports
     */
    private function collect(iterable $reports): PushDeliveryReport
    {
        $delivered = [];
        $expired = [];
        $failed = [];

        foreach ($reports as $report) {
            if ($report->isSuccess()) {
                $delivered[] = $report->getEndpoint();
                continue;
            }

            if ($report->isSubscriptionExpired()) {
                $expired[] = $report->getEndpoint();
                continue;
            }

            $failed[] = $report->getEndpoint();
            $this->logger->warning(message: 'Push notification could not be delivered.', context: [
                'endpoint' => $report->getEndpoint(),
                'reason' => $report->getReason(),
            ]);
        }

        return new PushDeliveryReport(
            deliveredEndpoints: $delivered,
            expiredEndpoints: $expired,
            failedEndpoints: $failed,
        );
    }
}
