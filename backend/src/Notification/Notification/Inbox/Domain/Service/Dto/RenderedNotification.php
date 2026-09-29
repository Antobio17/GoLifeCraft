<?php

namespace Notification\Notification\Inbox\Domain\Service\Dto;

final readonly class RenderedNotification
{
    public function __construct(
        public string $title,
        public string $body,
    ) {
    }
}
