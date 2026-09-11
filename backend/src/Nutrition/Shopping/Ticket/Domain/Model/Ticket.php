<?php

namespace Nutrition\Shopping\Ticket\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Shopping\Ticket\Domain\Event\TicketDeleted;
use Nutrition\Shopping\Ticket\Domain\Event\TicketItemLinked;
use Nutrition\Shopping\Ticket\Domain\Event\TicketItemRemoved;
use Nutrition\Shopping\Ticket\Domain\Event\TicketItemUnlinked;
use Nutrition\Shopping\Ticket\Domain\Event\TicketItemUpdated;
use Nutrition\Shopping\Ticket\Domain\Event\TicketLinesAdded;
use Nutrition\Shopping\Ticket\Domain\Event\TicketReceived;
use Nutrition\Shopping\Ticket\Domain\Event\TicketUnreceived;
use Nutrition\Shopping\Ticket\Domain\Exception\AddTicketLinesException;
use Nutrition\Shopping\Ticket\Domain\Exception\DeleteTicketException;
use Nutrition\Shopping\Ticket\Domain\Exception\LinkTicketItemException;
use Nutrition\Shopping\Ticket\Domain\Exception\ReceiveTicketException;
use Nutrition\Shopping\Ticket\Domain\Exception\RemoveTicketItemException;
use Nutrition\Shopping\Ticket\Domain\Exception\UnreceiveTicketException;
use Nutrition\Shopping\Ticket\Domain\Exception\UpdateTicketItemException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Ticket extends GenericAggregate
{
    public const string STATUS_DRAFT = 'draft';
    public const string STATUS_RECEIVED = 'received';

    public const int STORE_NAME_MAX_LENGTH = 255;
    public const int NOTE_MAX_LENGTH = 255;

    public string $storeName = '';
    public ?string $supermarketId = null;
    public string $purchasedOn = '';
    public ?float $total = null;
    public string $note = '';
    public string $status = self::STATUS_DRAFT;

    /**
     * @var array<int, array<string, mixed>>
     */
    public array $lines = [];

    /** @var TicketItem[] */
    public array $items = [];

    /**
     * @param TicketLineDraft[] $drafts
     */
    public function addLines(
        array $drafts,
        string $addedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if ([] === $drafts) {
            throw AddTicketLinesException::nothingToAdd(ticketId: $this->id);
        }

        $now = $dateTimeGenerator->now();
        $position = $this->lastPosition();
        $addedItemIds = [];

        foreach ($drafts as $draft) {
            $item = TicketItem::read(
                ticketId: $this->id,
                position: ++$position,
                draft: $draft,
                createdByUserId: $addedByUserId,
                dateTimeGenerator: $dateTimeGenerator,
            );

            $this->items[] = $item;
            $addedItemIds[] = $item->id;
        }

        $this->stampUpdate(userId: $addedByUserId, now: $now);

        $this->record(event: new TicketLinesAdded(
            aggregateId: $this->id,
            occurredOn: $now,
            storeName: $this->storeName,
            supermarketId: $this->supermarketId,
            purchasedOn: $this->purchasedOn,
            total: $this->total,
            note: $this->note,
            status: $this->status,
            addedItemIds: $addedItemIds,
            items: $this->recordedItems(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $addedByUserId,
        ));
    }

    public function linkItem(
        string $itemId,
        TicketArticleLink $article,
        string $linkedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $item = $this->item(itemId: $itemId);

        if (null === $item) {
            throw LinkTicketItemException::itemNotFound(ticketId: $this->id, itemId: $itemId);
        }

        if ($item->isReceived()) {
            throw LinkTicketItemException::alreadyReceived(ticketId: $this->id, itemId: $itemId);
        }

        $now = $dateTimeGenerator->now();

        $item->link(
            article: $article,
            linkSource: TicketItem::LINK_SOURCE_MANUAL,
            linkedByUserId: $linkedByUserId,
            now: $now,
        );
        $this->stampUpdate(userId: $linkedByUserId, now: $now);

        $this->record(event: new TicketItemLinked(
            aggregateId: $this->id,
            occurredOn: $now,
            itemId: $item->id,
            rawName: $item->rawName,
            articleId: $item->articleId,
            linkSource: $item->linkSource,
            storeName: $this->storeName,
            supermarketId: $this->supermarketId,
            purchasedOn: $this->purchasedOn,
            total: $this->total,
            note: $this->note,
            status: $this->status,
            items: $this->recordedItems(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $linkedByUserId,
        ));
    }

    public function unlinkItem(
        string $itemId,
        string $unlinkedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $item = $this->item(itemId: $itemId);

        if (null === $item) {
            throw LinkTicketItemException::itemNotFound(ticketId: $this->id, itemId: $itemId);
        }

        if ($item->isReceived()) {
            throw LinkTicketItemException::alreadyReceived(ticketId: $this->id, itemId: $itemId);
        }

        if (!$item->isLinked()) {
            throw LinkTicketItemException::notLinked(ticketId: $this->id, itemId: $itemId);
        }

        $now = $dateTimeGenerator->now();
        $previousArticleId = $item->articleId;

        $item->unlink(unlinkedByUserId: $unlinkedByUserId, now: $now);
        $this->stampUpdate(userId: $unlinkedByUserId, now: $now);

        $this->record(event: new TicketItemUnlinked(
            aggregateId: $this->id,
            occurredOn: $now,
            itemId: $item->id,
            rawName: $item->rawName,
            previousArticleId: $previousArticleId,
            storeName: $this->storeName,
            supermarketId: $this->supermarketId,
            purchasedOn: $this->purchasedOn,
            total: $this->total,
            note: $this->note,
            status: $this->status,
            items: $this->recordedItems(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $unlinkedByUserId,
        ));
    }

    public function removeItem(
        string $itemId,
        string $removedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $item = $this->item(itemId: $itemId);

        if (null === $item) {
            throw RemoveTicketItemException::itemNotFound(ticketId: $this->id, itemId: $itemId);
        }

        if ($item->isReceived()) {
            throw RemoveTicketItemException::alreadyReceived(ticketId: $this->id, itemId: $itemId);
        }

        $now = $dateTimeGenerator->now();

        $this->items = array_values(array: array_filter(
            array: $this->items,
            callback: static fn (TicketItem $candidate): bool => $candidate->id !== $itemId,
        ));
        $this->stampUpdate(userId: $removedByUserId, now: $now);

        $this->record(event: new TicketItemRemoved(
            aggregateId: $this->id,
            occurredOn: $now,
            itemId: $item->id,
            rawName: $item->rawName,
            articleId: $item->articleId,
            quantity: $item->quantity,
            unitPrice: $item->unitPrice,
            totalPrice: $item->totalPrice,
            storeName: $this->storeName,
            supermarketId: $this->supermarketId,
            purchasedOn: $this->purchasedOn,
            total: $this->total,
            note: $this->note,
            status: $this->status,
            items: $this->recordedItems(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $removedByUserId,
        ));
    }

    public function updateItem(
        string $itemId,
        float $quantity,
        ?float $unitPrice,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $item = $this->item(itemId: $itemId);

        if (null === $item) {
            throw UpdateTicketItemException::itemNotFound(ticketId: $this->id, itemId: $itemId);
        }

        if ($item->isReceived()) {
            throw UpdateTicketItemException::alreadyReceived(ticketId: $this->id, itemId: $itemId);
        }

        if ($quantity <= 0.0) {
            throw UpdateTicketItemException::quantityMustBePositive(quantity: $quantity);
        }

        if (null !== $unitPrice && $unitPrice < 0.0) {
            throw UpdateTicketItemException::priceCannotBeNegative(unitPrice: $unitPrice);
        }

        $now = $dateTimeGenerator->now();

        $item->adjust(
            quantity: $quantity,
            unitPrice: $unitPrice,
            updatedByUserId: $updatedByUserId,
            now: $now,
        );
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new TicketItemUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            itemId: $item->id,
            rawName: $item->rawName,
            quantity: $item->quantity,
            unitPrice: $item->unitPrice,
            totalPrice: $item->totalPrice,
            storeName: $this->storeName,
            supermarketId: $this->supermarketId,
            purchasedOn: $this->purchasedOn,
            total: $this->total,
            note: $this->note,
            status: $this->status,
            items: $this->recordedItems(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    public function receive(
        string $receivedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $unlinked = $this->unlinkedLineNames();

        if ([] !== $unlinked) {
            throw ReceiveTicketException::unlinkedLines(ticketId: $this->id, rawNames: $unlinked);
        }

        $receivable = $this->receivableItems();

        if ([] === $receivable) {
            throw ReceiveTicketException::nothingToReceive(ticketId: $this->id);
        }

        $now = $dateTimeGenerator->now();
        $receivedItemIds = [];

        foreach ($receivable as $item) {
            $item->markReceived(receivedByUserId: $receivedByUserId, now: $now);
            $receivedItemIds[] = $item->id;
        }

        $this->status = self::STATUS_RECEIVED;
        $this->stampUpdate(userId: $receivedByUserId, now: $now);

        $this->record(event: new TicketReceived(
            aggregateId: $this->id,
            occurredOn: $now,
            storeName: $this->storeName,
            supermarketId: $this->supermarketId,
            purchasedOn: $this->purchasedOn,
            total: $this->total,
            note: $this->note,
            status: $this->status,
            receivedItemIds: $receivedItemIds,
            items: $this->recordedItems(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $receivedByUserId,
        ));
    }

    public function unreceive(
        string $unreceivedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $received = $this->receivedItems();

        if ([] === $received) {
            throw UnreceiveTicketException::notReceived(ticketId: $this->id);
        }

        $now = $dateTimeGenerator->now();
        $returnedItemIds = [];

        foreach ($received as $item) {
            $item->markUnreceived(unreceivedByUserId: $unreceivedByUserId, now: $now);
            $returnedItemIds[] = $item->id;
        }

        $this->status = self::STATUS_DRAFT;
        $this->stampUpdate(userId: $unreceivedByUserId, now: $now);

        $this->record(event: new TicketUnreceived(
            aggregateId: $this->id,
            occurredOn: $now,
            storeName: $this->storeName,
            supermarketId: $this->supermarketId,
            purchasedOn: $this->purchasedOn,
            total: $this->total,
            note: $this->note,
            status: $this->status,
            returnedItemIds: $returnedItemIds,
            items: $this->recordedItems(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $unreceivedByUserId,
        ));
    }

    public function delete(
        string $deletedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if ([] !== $this->receivedItems()) {
            throw DeleteTicketException::alreadyReceived(ticketId: $this->id);
        }

        $now = $dateTimeGenerator->now();

        $this->record(event: new TicketDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
            storeName: $this->storeName,
            supermarketId: $this->supermarketId,
            purchasedOn: $this->purchasedOn,
            total: $this->total,
            note: $this->note,
            status: $this->status,
            items: $this->recordedItems(),
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            deletedByUserId: $deletedByUserId,
        ));
    }

    public function item(string $itemId): ?TicketItem
    {
        foreach ($this->items as $item) {
            if ($item->id === $itemId) {
                return $item;
            }
        }

        return null;
    }

    /**
     * @return TicketItem[]
     */
    public function receivableItems(): array
    {
        return array_values(array: array_filter(
            array: $this->items,
            callback: static fn (TicketItem $item): bool => $item->isReceivable(),
        ));
    }

    /**
     * @return TicketItem[]
     */
    public function receivedItems(): array
    {
        return array_values(array: array_filter(
            array: $this->items,
            callback: static fn (TicketItem $item): bool => $item->isReceived(),
        ));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function recordedItems(): array
    {
        return TicketItem::snapshotAll(aggregates: $this->items);
    }

    /**
     * @return string[]
     */
    private function unlinkedLineNames(): array
    {
        $names = [];

        foreach ($this->items as $item) {
            if ($item->isLinked()) {
                continue;
            }

            $names[] = $item->rawName;
        }

        return $names;
    }

    private function lastPosition(): int
    {
        $position = 0;

        foreach ($this->items as $item) {
            $position = max($position, $item->position);
        }

        return $position;
    }
}
