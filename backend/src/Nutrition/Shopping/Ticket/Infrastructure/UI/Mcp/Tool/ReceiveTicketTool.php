<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool\McpMessengerTool;
use Mcp\Capability\Attribute\McpTool;
use Nutrition\Shopping\Ticket\Application\Command\ReceiveTicketCommand;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(
    name: 'receive_ticket',
    description: 'Put a shopping ticket into the pantry: every line linked to an article adds its quantity to that article\'s stock, dated on the day the shopping was done. Lines that were never linked to an article add nothing. A ticket dated before the last validated count is recorded but does not move today\'s balance, because the count already overwrote everything older than itself. Create the ticket and its lines with write_model on "shopping_ticket" first.',
)]
final class ReceiveTicketTool extends McpMessengerTool
{
    /**
     * @param string $ticketId Id of the ticket to receive
     */
    public function __invoke(string $ticketId): array
    {
        return $this->dispatch(messageFactory: fn () => new ReceiveTicketCommand(
            ticketId: $ticketId,
            receivedByUserId: RequestExtractor::getUserSessionId(request: $this->request()),
        ));
    }
}
