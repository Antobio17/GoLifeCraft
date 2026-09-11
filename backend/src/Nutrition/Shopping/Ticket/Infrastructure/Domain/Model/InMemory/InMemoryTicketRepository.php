<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\Domain\Model\InMemory;

use Nutrition\Shopping\Ticket\Domain\Model\Ticket;
use Nutrition\Shopping\Ticket\Domain\Model\TicketRepository;

final class InMemoryTicketRepository implements TicketRepository
{
    /** @var Ticket[] */
    private array $tickets = [];

    private int $generatedIds = 0;

    public function nextId(): string
    {
        return 'ticket-'.(++$this->generatedIds);
    }

    public function findById(string $id): ?Ticket
    {
        foreach ($this->tickets as $ticket) {
            if ($ticket->id === $id) {
                return $ticket;
            }
        }

        return null;
    }

    public function save(Ticket $ticket): void
    {
        foreach ($this->tickets as $key => $existing) {
            if ($existing->id === $ticket->id) {
                $this->tickets[$key] = $ticket;

                return;
            }
        }

        $this->tickets[] = $ticket;
    }

    public function delete(Ticket $ticket): void
    {
        foreach ($this->tickets as $key => $existing) {
            if ($existing->id === $ticket->id) {
                unset($this->tickets[$key]);

                return;
            }
        }
    }
}
