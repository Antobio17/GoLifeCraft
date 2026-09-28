<?php

namespace Notification\Notification\Inbox\Domain\Model;

use Notification\Notification\Settings\Domain\Model\NotificationType;

final readonly class DueNotification
{
    /**
     * @param array<string, scalar|null> $params
     */
    public function __construct(
        public NotificationType $type,
        public string $sourceKey,
        public array $params,
        public ?string $url,
        public \DateTimeImmutable $dueAt,
    ) {
    }

    public function dedupeKeyFor(string $userId): string
    {
        return sprintf('%s:%s:%s', $userId, $this->type->value, $this->sourceKey);
    }
}
