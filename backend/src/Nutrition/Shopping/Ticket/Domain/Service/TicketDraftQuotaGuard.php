<?php

namespace Nutrition\Shopping\Ticket\Domain\Service;

interface TicketDraftQuotaGuard
{
    public function consume(string $userId): void;
}
