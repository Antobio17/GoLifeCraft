<?php

namespace Notification\Notification\Inbox\Domain\Model;

interface NotificationRepository
{
    public function nextId(): string;

    public function findById(string $id): ?Notification;

    public function save(Notification $notification): void;
}
