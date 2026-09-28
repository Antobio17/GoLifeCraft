<?php

namespace Shared\Push\Push\Domain\Service;

use Shared\Push\Push\Domain\Model\PushDeliveryReport;
use Shared\Push\Push\Domain\Model\PushNotification;
use Shared\Push\Push\Domain\Model\PushTarget;

interface PushNotificationSender
{
    public function isConfigured(): bool;

    public function publicKey(): ?string;

    /**
     * @param PushTarget[] $targets
     */
    public function send(PushNotification $notification, array $targets): PushDeliveryReport;
}
