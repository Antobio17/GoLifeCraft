<?php

namespace Nutrition\Shopping\Ticket\Domain\Service;

use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftExtraction;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftPhoto;

interface TicketDraftStore
{
    /**
     * @param TicketDraftPhoto[] $photos
     */
    public function find(string $userId, array $photos): ?TicketDraftExtraction;

    /**
     * @param TicketDraftPhoto[] $photos
     */
    public function keep(string $userId, array $photos, TicketDraftExtraction $extraction): void;
}
