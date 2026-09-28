<?php

namespace Notification\Notification\Inbox\Domain\Model;

interface NotificationRepository
{
    public function nextId(): string;

    public function save(Notification $notification): void;
}
