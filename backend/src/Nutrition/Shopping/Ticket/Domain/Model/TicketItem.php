<?php

namespace Nutrition\Shopping\Ticket\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class TicketItem extends GenericAggregate
{
    public const string LINK_SOURCE_MEMORY = 'memory';
    public const string LINK_SOURCE_CATALOG = 'catalog';
    public const string LINK_SOURCE_MANUAL = 'manual';

    public const int RAW_NAME_MAX_LENGTH = 255;
    public const int QUANTITY_PRECISION = 3;
    public const int PRICE_PRECISION = 2;

    public string $ticketId;
    public int $position;
    public string $rawName;
    public string $normalizedName;
    public float $quantity = 1.0;
    public ?string $rawUnit = null;
    public ?float $unitPrice = null;
    public ?float $totalPrice = null;
    public ?string $articleId = null;
    public ?string $linkSource = null;
    public ?string $articleNameSnapshot = null;
    public ?string $articleEmojiSnapshot = null;
    public ?string $packUnit = null;
    public ?float $packSize = null;
    public ?string $baseUnit = null;
    public ?float $baseQuantity = null;
    public ?\DateTime $receivedAt = null;

    public static function read(
        string $ticketId,
        int $position,
        TicketLineDraft $draft,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();
        $rawLine = $draft->rawLine;

        $item = new self();
        $item->id = Uuid::uuid4()->toString();
        $item->ticketId = $ticketId;
        $item->position = $position;
        $item->rawName = $rawLine->rawName;
        $item->normalizedName = TicketLineName::normalize(value: $rawLine->rawName);
        $item->quantity = round(num: $rawLine->quantity, precision: self::QUANTITY_PRECISION);
        $item->rawUnit = $rawLine->rawUnit;
        $item->unitPrice = self::roundedPrice(price: $rawLine->unitPrice);
        $item->totalPrice = self::roundedPrice(price: $rawLine->totalPrice);
        $item->stampCreation(userId: $createdByUserId, now: $now);

        if (null !== $draft->link) {
            $item->applyLink(article: $draft->link, linkSource: $draft->linkSource);
        }

        $item->completePrices();
        $item->recalculateBaseQuantity();

        return $item;
    }

    public function link(
        TicketArticleLink $article,
        string $linkSource,
        string $linkedByUserId,
        \DateTime $now,
    ): void {
        $this->applyLink(article: $article, linkSource: $linkSource);
        $this->recalculateBaseQuantity();
        $this->stampUpdate(userId: $linkedByUserId, now: $now);
    }

    public function unlink(string $unlinkedByUserId, \DateTime $now): void
    {
        $this->articleId = null;
        $this->linkSource = null;
        $this->articleNameSnapshot = null;
        $this->articleEmojiSnapshot = null;
        $this->packUnit = null;
        $this->packSize = null;
        $this->baseUnit = null;
        $this->baseQuantity = null;
        $this->stampUpdate(userId: $unlinkedByUserId, now: $now);
    }

    public function adjust(
        float $quantity,
        ?float $unitPrice,
        string $updatedByUserId,
        \DateTime $now,
    ): void {
        $this->quantity = round(num: $quantity, precision: self::QUANTITY_PRECISION);
        $this->unitPrice = self::roundedPrice(price: $unitPrice);
        $this->totalPrice = null === $this->unitPrice
            ? null
            : self::roundedPrice(price: $this->unitPrice * $this->quantity);
        $this->recalculateBaseQuantity();
        $this->stampUpdate(userId: $updatedByUserId, now: $now);
    }

    public function markReceived(string $receivedByUserId, \DateTime $now): void
    {
        $this->receivedAt = $now;
        $this->stampUpdate(userId: $receivedByUserId, now: $now);
    }

    public function markUnreceived(string $unreceivedByUserId, \DateTime $now): void
    {
        $this->receivedAt = null;
        $this->stampUpdate(userId: $unreceivedByUserId, now: $now);
    }

    public function isLinked(): bool
    {
        return null !== $this->articleId;
    }

    public function isReceived(): bool
    {
        return null !== $this->receivedAt;
    }

    public function isReceivable(): bool
    {
        return $this->isLinked() && !$this->isReceived();
    }

    private function applyLink(TicketArticleLink $article, string $linkSource): void
    {
        $this->articleId = $article->articleId;
        $this->linkSource = $linkSource;
        $this->articleNameSnapshot = $article->name;
        $this->articleEmojiSnapshot = $article->emoji;
        $this->packUnit = $article->packUnit;
        $this->packSize = $article->packSize;
        $this->baseUnit = $article->baseUnit;
    }

    private function completePrices(): void
    {
        if (null === $this->unitPrice && null !== $this->totalPrice && $this->quantity > 0.0) {
            $this->unitPrice = self::roundedPrice(price: $this->totalPrice / $this->quantity);

            return;
        }

        if (null === $this->totalPrice && null !== $this->unitPrice) {
            $this->totalPrice = self::roundedPrice(price: $this->unitPrice * $this->quantity);
        }
    }

    private function recalculateBaseQuantity(): void
    {
        if (!$this->isLinked()) {
            $this->baseQuantity = null;

            return;
        }

        $packSize = null !== $this->packSize && $this->packSize > 0.0 ? $this->packSize : 1.0;

        $this->baseQuantity = round(num: $this->quantity * $packSize, precision: self::QUANTITY_PRECISION);
    }

    private static function roundedPrice(?float $price): ?float
    {
        return null === $price ? null : round(num: $price, precision: self::PRICE_PRECISION);
    }
}
