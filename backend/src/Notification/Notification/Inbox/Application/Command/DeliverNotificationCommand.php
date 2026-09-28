<?php

namespace Notification\Notification\Inbox\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class DeliverNotificationCommand implements Command
{
    /**
     * @param array<string, scalar|null> $params
     */
    public function __construct(
        public string $userId,
        public string $type,
        public string $dedupeKey,
        public array $params,
        public ?string $url,
        public \DateTimeImmutable $dueAt,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.notification.command.1.notification.deliver';
    }
}
