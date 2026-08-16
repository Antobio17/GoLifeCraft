<?php

namespace Economy\Finance\Transaction\Domain\Model;

use Economy\Finance\Transaction\Domain\Event\FinanceTransactionCreated;
use Economy\Finance\Transaction\Domain\Event\FinanceTransactionDeleted;
use Economy\Finance\Transaction\Domain\Event\FinanceTransactionUpdated;
use Economy\Finance\Transaction\Domain\Exception\CreateFinanceTransactionException;
use Economy\Finance\Transaction\Domain\Exception\UpdateFinanceTransactionException;
use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class FinanceTransaction extends GenericAggregate
{
    public const KIND_EXPENSE = 'expense';
    public const KIND_INCOME = 'income';

    public const SOURCE_MANUAL = 'manual';
    public const SOURCE_TICKET = 'ticket';

    public const CATEGORY_OTHER = 'other';

    public const NOTE_MAX_LENGTH = 255;
    public const STORE_MAX_LENGTH = 120;
    public const AMOUNT_MAX = 9999999.99;

    /** @var array<int, string> */
    public const KINDS = [
        self::KIND_EXPENSE,
        self::KIND_INCOME,
    ];

    /** @var array<int, string> */
    public const SOURCES = [
        self::SOURCE_MANUAL,
        self::SOURCE_TICKET,
    ];

    /** @var array<int, string> */
    public const CATEGORIES = [
        'groceries',
        'restaurants',
        'gym',
        'transport',
        'leisure',
        'home',
        'health',
        'subscriptions',
        self::CATEGORY_OTHER,
    ];

    public string $transactionDate;
    public string $kind;
    public float $amount;
    public string $category;
    public string $note = '';
    public ?string $store = null;
    public bool $recurring = false;
    public string $source = self::SOURCE_MANUAL;

    public static function create(
        string $id,
        string $transactionDate,
        string $kind,
        float $amount,
        string $category,
        string $note,
        ?string $store,
        bool $recurring,
        string $source,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if (!self::hasValidDate(transactionDate: $transactionDate)) {
            throw CreateFinanceTransactionException::invalidDate(transactionDate: $transactionDate);
        }

        if (!in_array(needle: $kind, haystack: self::KINDS, strict: true)) {
            throw CreateFinanceTransactionException::invalidKind(kind: $kind);
        }

        if (!self::hasValidAmount(amount: $amount)) {
            throw CreateFinanceTransactionException::invalidAmount(amount: $amount);
        }

        if (!self::hasValidCategory(category: $category)) {
            throw CreateFinanceTransactionException::invalidCategory(category: $category);
        }

        if (!self::hasValidNote(note: $note)) {
            throw CreateFinanceTransactionException::noteTooLong(maxLength: self::NOTE_MAX_LENGTH);
        }

        if (!self::hasValidStore(store: $store)) {
            throw CreateFinanceTransactionException::storeTooLong(maxLength: self::STORE_MAX_LENGTH);
        }

        if (!in_array(needle: $source, haystack: self::SOURCES, strict: true)) {
            throw CreateFinanceTransactionException::invalidSource(source: $source);
        }

        $now = $dateTimeGenerator->now();

        $transaction = new self();
        $transaction->id = $id;
        $transaction->write(
            transactionDate: $transactionDate,
            kind: $kind,
            amount: $amount,
            category: $category,
            note: $note,
            store: $store,
            recurring: $recurring,
        );
        $transaction->source = $source;
        $transaction->stampCreation(userId: $createdByUserId, now: $now);

        $transaction->record(event: new FinanceTransactionCreated(
            aggregateId: $id,
            occurredOn: $now,
            transactionDate: $transaction->transactionDate,
            kind: $transaction->kind,
            amount: $transaction->amount,
            category: $transaction->category,
            note: $transaction->note,
            store: $transaction->store,
            recurring: $transaction->recurring,
            source: $transaction->source,
            createdAt: $transaction->createdAt,
            updatedAt: $transaction->updatedAt,
            createdByUserId: $transaction->createdByUserId,
            updatedByUserId: $transaction->updatedByUserId,
        ));

        return $transaction;
    }

    public function update(
        string $transactionDate,
        string $kind,
        float $amount,
        string $category,
        string $note,
        ?string $store,
        bool $recurring,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!self::hasValidDate(transactionDate: $transactionDate)) {
            throw UpdateFinanceTransactionException::invalidDate(transactionDate: $transactionDate);
        }

        if (!in_array(needle: $kind, haystack: self::KINDS, strict: true)) {
            throw UpdateFinanceTransactionException::invalidKind(kind: $kind);
        }

        if (!self::hasValidAmount(amount: $amount)) {
            throw UpdateFinanceTransactionException::invalidAmount(amount: $amount);
        }

        if (!self::hasValidCategory(category: $category)) {
            throw UpdateFinanceTransactionException::invalidCategory(category: $category);
        }

        if (!self::hasValidNote(note: $note)) {
            throw UpdateFinanceTransactionException::noteTooLong(maxLength: self::NOTE_MAX_LENGTH);
        }

        if (!self::hasValidStore(store: $store)) {
            throw UpdateFinanceTransactionException::storeTooLong(maxLength: self::STORE_MAX_LENGTH);
        }

        $now = $dateTimeGenerator->now();

        $this->write(
            transactionDate: $transactionDate,
            kind: $kind,
            amount: $amount,
            category: $category,
            note: $note,
            store: $store,
            recurring: $recurring,
        );
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new FinanceTransactionUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            transactionDate: $this->transactionDate,
            kind: $this->kind,
            amount: $this->amount,
            category: $this->category,
            note: $this->note,
            store: $this->store,
            recurring: $this->recurring,
            source: $this->source,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function delete(
        string $deletedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $deletedByUserId, now: $now);

        $this->record(event: new FinanceTransactionDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
            transactionDate: $this->transactionDate,
            kind: $this->kind,
            amount: $this->amount,
            category: $this->category,
            note: $this->note,
            store: $this->store,
            recurring: $this->recurring,
            source: $this->source,
            deletedByUserId: $deletedByUserId,
        ));
    }

    public static function normalizeAmount(float $amount): float
    {
        return round(num: $amount, precision: 2);
    }

    private function write(
        string $transactionDate,
        string $kind,
        float $amount,
        string $category,
        string $note,
        ?string $store,
        bool $recurring,
    ): void {
        $this->transactionDate = $transactionDate;
        $this->kind = $kind;
        $this->amount = self::normalizeAmount(amount: $amount);
        $this->category = self::KIND_INCOME === $kind ? self::CATEGORY_OTHER : $category;
        $this->note = trim(string: $note);
        $this->store = '' === trim(string: (string) $store) ? null : trim(string: (string) $store);
        $this->recurring = self::KIND_INCOME === $kind ? false : $recurring;
    }

    private static function hasValidDate(string $transactionDate): bool
    {
        return 1 === preg_match(pattern: '/^\d{4}-\d{2}-\d{2}$/', subject: $transactionDate);
    }

    private static function hasValidAmount(float $amount): bool
    {
        $amount = self::normalizeAmount(amount: $amount);

        return $amount > 0 && $amount <= self::AMOUNT_MAX;
    }

    private static function hasValidCategory(string $category): bool
    {
        return in_array(needle: $category, haystack: self::CATEGORIES, strict: true);
    }

    private static function hasValidNote(string $note): bool
    {
        return mb_strlen(string: trim(string: $note)) <= self::NOTE_MAX_LENGTH;
    }

    private static function hasValidStore(?string $store): bool
    {
        return mb_strlen(string: trim(string: (string) $store)) <= self::STORE_MAX_LENGTH;
    }
}
