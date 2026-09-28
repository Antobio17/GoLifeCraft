<?php

namespace Authorization\User\PushSubscription\Domain\Model;

use Authorization\User\PushSubscription\Domain\Event\PushSubscriptionRegistered;
use Authorization\User\PushSubscription\Domain\Event\PushSubscriptionRemoved;
use Authorization\User\PushSubscription\Domain\Event\PushSubscriptionRenewed;
use Authorization\User\PushSubscription\Domain\Exception\SubscribeToPushNotificationsException;
use Shared\Push\Push\Domain\Model\PushTarget;
use Shared\Shared\Shared\Domain\Model\Aggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class PushSubscription extends Aggregate
{
    public const string CONTENT_ENCODING_AESGCM = 'aesgcm';
    public const string CONTENT_ENCODING_AES128GCM = 'aes128gcm';
    public const array CONTENT_ENCODINGS = [self::CONTENT_ENCODING_AESGCM, self::CONTENT_ENCODING_AES128GCM];
    public const string REMOVAL_REASON_UNSUBSCRIBED = 'unsubscribed';
    public const string REMOVAL_REASON_EXPIRED = 'expired';

    private const int MAX_ENDPOINT_LENGTH = 2048;
    private const int MAX_USER_AGENT_LENGTH = 255;

    private int $version;

    public function __construct(
        public readonly string $id,
        public string $userId,
        public readonly string $endpoint,
        public readonly string $endpointHash,
        public string $publicKey,
        public string $authToken,
        public string $contentEncoding,
        public ?string $userAgent,
        public readonly \DateTime $createdAt,
        public \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public string $updatedByUserId,
    ) {
    }

    public static function hashEndpoint(string $endpoint): string
    {
        return hash(algo: 'sha256', data: $endpoint);
    }

    public static function subscribe(
        string $id,
        string $userId,
        string $endpoint,
        string $publicKey,
        string $authToken,
        string $contentEncoding,
        ?string $userAgent,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        self::assertEndpoint(endpoint: $endpoint);
        self::assertKeys(publicKey: $publicKey, authToken: $authToken, contentEncoding: $contentEncoding);

        $now = $dateTimeGenerator->now();
        $subscription = new self(
            id: $id,
            userId: $userId,
            endpoint: $endpoint,
            endpointHash: self::hashEndpoint(endpoint: $endpoint),
            publicKey: $publicKey,
            authToken: $authToken,
            contentEncoding: $contentEncoding,
            userAgent: self::trimUserAgent(userAgent: $userAgent),
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $userId,
            updatedByUserId: $userId,
        );

        $subscription->record(event: new PushSubscriptionRegistered(
            aggregateId: $id,
            occurredOn: $now,
            userId: $subscription->userId,
            endpoint: $subscription->endpoint,
            endpointHash: $subscription->endpointHash,
            contentEncoding: $subscription->contentEncoding,
            userAgent: $subscription->userAgent,
            createdAt: $subscription->createdAt,
            updatedAt: $subscription->updatedAt,
            createdByUserId: $subscription->createdByUserId,
            updatedByUserId: $subscription->updatedByUserId,
        ));

        return $subscription;
    }

    public function renew(
        string $userId,
        string $publicKey,
        string $authToken,
        string $contentEncoding,
        ?string $userAgent,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        self::assertKeys(publicKey: $publicKey, authToken: $authToken, contentEncoding: $contentEncoding);

        $now = $dateTimeGenerator->now();
        $previousUserId = $this->userId;
        $this->userId = $userId;
        $this->publicKey = $publicKey;
        $this->authToken = $authToken;
        $this->contentEncoding = $contentEncoding;
        $this->userAgent = self::trimUserAgent(userAgent: $userAgent);
        $this->updatedAt = $now;
        $this->updatedByUserId = $userId;

        $this->record(event: new PushSubscriptionRenewed(
            aggregateId: $this->id,
            occurredOn: $now,
            previousUserId: $previousUserId,
            userId: $this->userId,
            endpoint: $this->endpoint,
            endpointHash: $this->endpointHash,
            contentEncoding: $this->contentEncoding,
            userAgent: $this->userAgent,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function remove(string $reason, string $removedByUserId, DateTimeGenerator $dateTimeGenerator): void
    {
        $now = $dateTimeGenerator->now();
        $this->updatedAt = $now;
        $this->updatedByUserId = $removedByUserId;

        $this->record(event: new PushSubscriptionRemoved(
            aggregateId: $this->id,
            occurredOn: $now,
            reason: $reason,
            userId: $this->userId,
            endpoint: $this->endpoint,
            endpointHash: $this->endpointHash,
            contentEncoding: $this->contentEncoding,
            userAgent: $this->userAgent,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            removedByUserId: $removedByUserId,
        ));
    }

    public function belongsTo(string $userId): bool
    {
        return $this->userId === $userId;
    }

    public function target(): PushTarget
    {
        return new PushTarget(
            endpoint: $this->endpoint,
            publicKey: $this->publicKey,
            authToken: $this->authToken,
            contentEncoding: $this->contentEncoding,
        );
    }

    private static function assertEndpoint(string $endpoint): void
    {
        if (strlen(string: $endpoint) > self::MAX_ENDPOINT_LENGTH) {
            throw SubscribeToPushNotificationsException::invalidEndpoint(endpoint: $endpoint);
        }

        if ('https' !== parse_url(url: $endpoint, component: PHP_URL_SCHEME)) {
            throw SubscribeToPushNotificationsException::invalidEndpoint(endpoint: $endpoint);
        }

        if (!filter_var(value: $endpoint, filter: FILTER_VALIDATE_URL)) {
            throw SubscribeToPushNotificationsException::invalidEndpoint(endpoint: $endpoint);
        }
    }

    private static function assertKeys(string $publicKey, string $authToken, string $contentEncoding): void
    {
        if ('' === trim(string: $publicKey) || '' === trim(string: $authToken)) {
            throw SubscribeToPushNotificationsException::missingKeys();
        }

        if (!in_array(needle: $contentEncoding, haystack: self::CONTENT_ENCODINGS, strict: true)) {
            throw SubscribeToPushNotificationsException::invalidContentEncoding(contentEncoding: $contentEncoding);
        }
    }

    private static function trimUserAgent(?string $userAgent): ?string
    {
        if (null === $userAgent || '' === trim(string: $userAgent)) {
            return null;
        }

        return mb_substr(string: trim(string: $userAgent), start: 0, length: self::MAX_USER_AGENT_LENGTH);
    }
}
