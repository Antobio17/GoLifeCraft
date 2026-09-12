<?php

namespace Nutrition\Shopping\Ticket\Domain\QueryModel\Dto;

final readonly class TicketDraftPhoto
{
    public function __construct(
        public string $path,
        public string $mimeType,
    ) {
    }
}
