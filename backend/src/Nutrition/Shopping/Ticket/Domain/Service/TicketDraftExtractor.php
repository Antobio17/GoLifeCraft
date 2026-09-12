<?php

namespace Nutrition\Shopping\Ticket\Domain\Service;

use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftExtraction;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftGrounding;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftPhoto;

interface TicketDraftExtractor
{
    /**
     * @param TicketDraftPhoto[] $photos
     */
    public function extract(array $photos, TicketDraftGrounding $grounding): TicketDraftExtraction;
}
