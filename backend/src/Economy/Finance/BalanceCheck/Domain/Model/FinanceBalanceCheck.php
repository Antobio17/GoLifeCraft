<?php

namespace Economy\Finance\BalanceCheck\Domain\Model;

use Economy\Finance\BalanceCheck\Domain\Event\FinanceBalanceCheckCreated;
use Economy\Finance\BalanceCheck\Domain\Event\FinanceBalanceCheckDeleted;
use Economy\Finance\BalanceCheck\Domain\Event\FinanceBalanceCheckUpdated;
use Economy\Finance\BalanceCheck\Domain\Exception\CreateFinanceBalanceCheckException;
use Economy\Finance\BalanceCheck\Domain\Exception\UpdateFinanceBalanceCheckException;
use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class FinanceBalanceCheck extends GenericAggregate
{
    public const NOTE_MAX_LENGTH = 255;
    public const AMOUNT_LIMIT = 9999999.99;

    public string $accountId;
    public string $checkDate;
    public float $amount;
    public string $note = '';

    public static function create(
        string $id,
        string $accountId,
        string $checkDate,
        float $amount,
        string $note,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if ('' === trim(string: $accountId)) {
            throw CreateFinanceBalanceCheckException::accountRequired();
        }

        if (!self::hasValidDate(checkDate: $checkDate)) {
            throw CreateFinanceBalanceCheckException::invalidDate(checkDate: $checkDate);
        }

        if (!self::hasValidAmount(amount: $amount)) {
            throw CreateFinanceBalanceCheckException::invalidAmount(amount: $amount);
        }

        if (!self::hasValidNote(note: $note)) {
            throw CreateFinanceBalanceCheckException::noteTooLong(maxLength: self::NOTE_MAX_LENGTH);
        }

        $now = $dateTimeGenerator->now();

        $financeBalanceCheck = new self();
        $financeBalanceCheck->id = $id;
        $financeBalanceCheck->accountId = trim(string: $accountId);
        $financeBalanceCheck->write(checkDate: $checkDate, amount: $amount, note: $note);
        $financeBalanceCheck->stampCreation(userId: $createdByUserId, now: $now);

        $financeBalanceCheck->record(event: new FinanceBalanceCheckCreated(
            aggregateId: $id,
            occurredOn: $now,
            accountId: $financeBalanceCheck->accountId,
            checkDate: $financeBalanceCheck->checkDate,
            amount: $financeBalanceCheck->amount,
            note: $financeBalanceCheck->note,
            createdAt: $financeBalanceCheck->createdAt,
            updatedAt: $financeBalanceCheck->updatedAt,
            createdByUserId: $financeBalanceCheck->createdByUserId,
            updatedByUserId: $financeBalanceCheck->updatedByUserId,
        ));

        return $financeBalanceCheck;
    }

    public function update(
        string $checkDate,
        float $amount,
        string $note,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!self::hasValidDate(checkDate: $checkDate)) {
            throw UpdateFinanceBalanceCheckException::invalidDate(checkDate: $checkDate);
        }

        if (!self::hasValidAmount(amount: $amount)) {
            throw UpdateFinanceBalanceCheckException::invalidAmount(amount: $amount);
        }

        if (!self::hasValidNote(note: $note)) {
            throw UpdateFinanceBalanceCheckException::noteTooLong(maxLength: self::NOTE_MAX_LENGTH);
        }

        $now = $dateTimeGenerator->now();

        $this->write(checkDate: $checkDate, amount: $amount, note: $note);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new FinanceBalanceCheckUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            accountId: $this->accountId,
            checkDate: $this->checkDate,
            amount: $this->amount,
            note: $this->note,
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

        $this->record(event: new FinanceBalanceCheckDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
            accountId: $this->accountId,
            checkDate: $this->checkDate,
            amount: $this->amount,
            note: $this->note,
            deletedByUserId: $deletedByUserId,
        ));
    }

    public static function normalizeAmount(float $amount): float
    {
        return round(num: $amount, precision: 2);
    }

    private function write(string $checkDate, float $amount, string $note): void
    {
        $this->checkDate = $checkDate;
        $this->amount = self::normalizeAmount(amount: $amount);
        $this->note = trim(string: $note);
    }

    private static function hasValidDate(string $checkDate): bool
    {
        return 1 === preg_match(pattern: '/^\d{4}-\d{2}-\d{2}$/', subject: $checkDate);
    }

    private static function hasValidAmount(float $amount): bool
    {
        return abs(num: self::normalizeAmount(amount: $amount)) <= self::AMOUNT_LIMIT;
    }

    private static function hasValidNote(string $note): bool
    {
        return mb_strlen(string: trim(string: $note)) <= self::NOTE_MAX_LENGTH;
    }
}
