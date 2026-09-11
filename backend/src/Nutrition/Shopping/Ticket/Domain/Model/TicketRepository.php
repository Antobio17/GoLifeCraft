<?php

namespace Nutrition\Shopping\Ticket\Domain\Model;

interface TicketRepository
{
    public function nextId(): string;

    public function findById(string $id): ?Ticket;

    public function save(Ticket $ticket): void;

    public function delete(Ticket $ticket): void;
}
