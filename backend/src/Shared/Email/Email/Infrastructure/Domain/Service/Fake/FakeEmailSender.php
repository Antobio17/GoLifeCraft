<?php

namespace Shared\Email\Email\Infrastructure\Domain\Service\Fake;

use Shared\Email\Email\Domain\Model\EmailMessage;
use Shared\Email\Email\Domain\Service\EmailSender;

final class FakeEmailSender implements EmailSender
{
    /** @var EmailMessage[] */
    private array $sent = [];

    public function send(EmailMessage $message): void
    {
        $this->sent[] = $message;
    }

    /** @return EmailMessage[] */
    public function sentMessages(): array
    {
        return $this->sent;
    }

    public function lastSent(): ?EmailMessage
    {
        return end($this->sent) ?: null;
    }

    public function clear(): void
    {
        $this->sent = [];
    }
}
