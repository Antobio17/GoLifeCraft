<?php

namespace Shared\Email\Email\Domain\Service;

use Shared\Email\Email\Domain\Model\EmailMessage;

interface EmailSender
{
    public function send(EmailMessage $message): void;
}
