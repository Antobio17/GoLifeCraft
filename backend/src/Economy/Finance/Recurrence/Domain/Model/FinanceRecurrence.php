<?php

namespace Economy\Finance\Recurrence\Domain\Model;

use Economy\Finance\Recurrence\Domain\Event\FinanceRecurrenceCreated;
use Economy\Finance\Recurrence\Domain\Event\FinanceRecurrenceDeleted;
use Economy\Finance\Recurrence\Domain\Event\FinanceRecurrenceGenerated;
use Economy\Finance\Recurrence\Domain\Event\FinanceRecurrenceUpdated;
use Economy\Finance\Recurrence\Domain\Exception\CreateFinanceRecurrenceException;
use Economy\Finance\Recurrence\Domain\Exception\UpdateFinanceRecurrenceException;
use Economy\Finance\Recurrence\Domain\Service\FinanceRecurrenceCalendar;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class FinanceRecurrence extends GenericAggregate
{
    public const NOTE_MAX_LENGTH = 255;
    public const STORE_MAX_LENGTH = 120;
    public const AMOUNT_MAX = 9999999.99;
    public const DAY_OF_MONTH_MIN = 1;
    public const DAY_OF_MONTH_MAX = 31;

    public string $accountId;
    public string $kind;
    public float $amount;
    public string $category;
    public string $note = '';
    public ?string $store = null;
    public int $dayOfMonth;
    public string $startMonth;
    public ?string $endMonth = null;
    public bool $active = true;
    public ?string $lastRunMonth = null;

    public static function create(
        string $id,
        string $accountId,
        string $kind,
        float $amount,
        string $category,
        string $note,
        ?string $store,
        int $dayOfMonth,
        string $startMonth,
        ?string $endMonth,
        bool $active,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if (!self::hasValidAccountId(accountId: $accountId)) {
            throw CreateFinanceRecurrenceException::accountRequired();
        }

        if (!in_array(needle: $kind, haystack: FinanceTransaction::KINDS, strict: true)) {
            throw CreateFinanceRecurrenceException::invalidKind(kind: $kind);
        }

        if (!self::hasValidAmount(amount: $amount)) {
            throw CreateFinanceRecurrenceException::invalidAmount(amount: $amount);
        }

        if (!self::hasValidCategory(category: $category)) {
            throw CreateFinanceRecurrenceException::invalidCategory(category: $category);
        }

        if (!self::hasValidNote(note: $note)) {
            throw CreateFinanceRecurrenceException::noteTooLong(maxLength: self::NOTE_MAX_LENGTH);
        }

        if (!self::hasValidStore(store: $store)) {
            throw CreateFinanceRecurrenceException::storeTooLong(maxLength: self::STORE_MAX_LENGTH);
        }

        if (!self::hasValidDayOfMonth(dayOfMonth: $dayOfMonth)) {
            throw CreateFinanceRecurrenceException::invalidDayOfMonth(dayOfMonth: $dayOfMonth);
        }

        if (!self::hasValidMonth(month: $startMonth)) {
            throw CreateFinanceRecurrenceException::invalidMonth(month: $startMonth);
        }

        if (null !== $endMonth && !self::hasValidMonth(month: $endMonth)) {
            throw CreateFinanceRecurrenceException::invalidMonth(month: $endMonth);
        }

        if (null !== $endMonth && $endMonth < $startMonth) {
            throw CreateFinanceRecurrenceException::endMonthBeforeStartMonth(
                startMonth: $startMonth,
                endMonth: $endMonth,
            );
        }

        $now = $dateTimeGenerator->now();

        $financeRecurrence = new self();
        $financeRecurrence->id = $id;
        $financeRecurrence->write(
            accountId: $accountId,
            kind: $kind,
            amount: $amount,
            category: $category,
            note: $note,
            store: $store,
            dayOfMonth: $dayOfMonth,
            startMonth: $startMonth,
            endMonth: $endMonth,
            active: $active,
        );
        $financeRecurrence->stampCreation(userId: $createdByUserId, now: $now);

        $financeRecurrence->record(event: new FinanceRecurrenceCreated(
            aggregateId: $id,
            occurredOn: $now,
            accountId: $financeRecurrence->accountId,
            kind: $financeRecurrence->kind,
            amount: $financeRecurrence->amount,
            category: $financeRecurrence->category,
            note: $financeRecurrence->note,
            store: $financeRecurrence->store,
            dayOfMonth: $financeRecurrence->dayOfMonth,
            startMonth: $financeRecurrence->startMonth,
            endMonth: $financeRecurrence->endMonth,
            active: $financeRecurrence->active,
            lastRunMonth: $financeRecurrence->lastRunMonth,
            createdAt: $financeRecurrence->createdAt,
            updatedAt: $financeRecurrence->updatedAt,
            createdByUserId: $financeRecurrence->createdByUserId,
            updatedByUserId: $financeRecurrence->updatedByUserId,
        ));

        return $financeRecurrence;
    }

    public function update(
        string $accountId,
        string $kind,
        float $amount,
        string $category,
        string $note,
        ?string $store,
        int $dayOfMonth,
        string $startMonth,
        ?string $endMonth,
        bool $active,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!self::hasValidAccountId(accountId: $accountId)) {
            throw UpdateFinanceRecurrenceException::accountRequired();
        }

        if (!in_array(needle: $kind, haystack: FinanceTransaction::KINDS, strict: true)) {
            throw UpdateFinanceRecurrenceException::invalidKind(kind: $kind);
        }

        if (!self::hasValidAmount(amount: $amount)) {
            throw UpdateFinanceRecurrenceException::invalidAmount(amount: $amount);
        }

        if (!self::hasValidCategory(category: $category)) {
            throw UpdateFinanceRecurrenceException::invalidCategory(category: $category);
        }

        if (!self::hasValidNote(note: $note)) {
            throw UpdateFinanceRecurrenceException::noteTooLong(maxLength: self::NOTE_MAX_LENGTH);
        }

        if (!self::hasValidStore(store: $store)) {
            throw UpdateFinanceRecurrenceException::storeTooLong(maxLength: self::STORE_MAX_LENGTH);
        }

        if (!self::hasValidDayOfMonth(dayOfMonth: $dayOfMonth)) {
            throw UpdateFinanceRecurrenceException::invalidDayOfMonth(dayOfMonth: $dayOfMonth);
        }

        if (!self::hasValidMonth(month: $startMonth)) {
            throw UpdateFinanceRecurrenceException::invalidMonth(month: $startMonth);
        }

        if (null !== $endMonth && !self::hasValidMonth(month: $endMonth)) {
            throw UpdateFinanceRecurrenceException::invalidMonth(month: $endMonth);
        }

        if (null !== $endMonth && $endMonth < $startMonth) {
            throw UpdateFinanceRecurrenceException::endMonthBeforeStartMonth(
                startMonth: $startMonth,
                endMonth: $endMonth,
            );
        }

        $now = $dateTimeGenerator->now();
        $wasPaused = !$this->active;

        $this->write(
            accountId: $accountId,
            kind: $kind,
            amount: $amount,
            category: $category,
            note: $note,
            store: $store,
            dayOfMonth: $dayOfMonth,
            startMonth: $startMonth,
            endMonth: $endMonth,
            active: $active,
        );

        if ($wasPaused && $this->active) {
            $this->lastRunMonth = $this->monthsSkippedWhilePaused(now: $now);
        }

        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new FinanceRecurrenceUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            accountId: $this->accountId,
            kind: $this->kind,
            amount: $this->amount,
            category: $this->category,
            note: $this->note,
            store: $this->store,
            dayOfMonth: $this->dayOfMonth,
            startMonth: $this->startMonth,
            endMonth: $this->endMonth,
            active: $this->active,
            lastRunMonth: $this->lastRunMonth,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function generate(string $month, DateTimeGenerator $dateTimeGenerator): void
    {
        $now = $dateTimeGenerator->now();

        $this->lastRunMonth = $month;
        $this->stampUpdate(userId: $this->createdByUserId, now: $now);

        $this->record(event: new FinanceRecurrenceGenerated(
            aggregateId: $this->id,
            occurredOn: $now,
            accountId: $this->accountId,
            kind: $this->kind,
            amount: $this->amount,
            category: $this->category,
            note: $this->note,
            store: $this->store,
            dayOfMonth: $this->dayOfMonth,
            startMonth: $this->startMonth,
            endMonth: $this->endMonth,
            active: $this->active,
            lastRunMonth: $this->lastRunMonth,
            month: $month,
            transactionDate: $this->chargeDateOf(month: $month),
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

        $this->record(event: new FinanceRecurrenceDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
            accountId: $this->accountId,
            kind: $this->kind,
            amount: $this->amount,
            category: $this->category,
            note: $this->note,
            store: $this->store,
            dayOfMonth: $this->dayOfMonth,
            startMonth: $this->startMonth,
            endMonth: $this->endMonth,
            active: $this->active,
            lastRunMonth: $this->lastRunMonth,
            deletedByUserId: $deletedByUserId,
        ));
    }

    public function isPendingFor(string $month, string $today): bool
    {
        if (!$this->active) {
            return false;
        }

        if ($month < $this->startMonth) {
            return false;
        }

        if (null !== $this->endMonth && $month > $this->endMonth) {
            return false;
        }

        if (null !== $this->lastRunMonth && $month <= $this->lastRunMonth) {
            return false;
        }

        return $this->chargeDateOf(month: $month) <= $today;
    }

    public function chargeDateOf(string $month): string
    {
        return FinanceRecurrenceCalendar::chargeDate(month: $month, dayOfMonth: $this->dayOfMonth);
    }

    /**
     * Resuming a paused recurrence never books the months it slept through: it
     * picks up from the month it is resumed in.
     */
    private function monthsSkippedWhilePaused(\DateTime $now): ?string
    {
        $previousMonth = FinanceRecurrenceCalendar::shiftMonth(
            month: $now->format(format: 'Y-m'),
            offset: -1,
        );

        if (null !== $this->lastRunMonth && $this->lastRunMonth >= $previousMonth) {
            return $this->lastRunMonth;
        }

        return $previousMonth;
    }

    private function write(
        string $accountId,
        string $kind,
        float $amount,
        string $category,
        string $note,
        ?string $store,
        int $dayOfMonth,
        string $startMonth,
        ?string $endMonth,
        bool $active,
    ): void {
        $this->accountId = trim(string: $accountId);
        $this->kind = $kind;
        $this->amount = round(num: $amount, precision: 2);
        $this->category = FinanceTransaction::KIND_INCOME === $kind
            ? FinanceTransaction::CATEGORY_OTHER
            : $category;
        $this->note = trim(string: $note);
        $this->store = '' === trim(string: (string) $store) ? null : trim(string: (string) $store);
        $this->dayOfMonth = $dayOfMonth;
        $this->startMonth = $startMonth;
        $this->endMonth = $endMonth;
        $this->active = $active;
    }

    private static function hasValidAccountId(string $accountId): bool
    {
        return '' !== trim(string: $accountId);
    }

    private static function hasValidAmount(float $amount): bool
    {
        $amount = round(num: $amount, precision: 2);

        return $amount > 0 && $amount <= self::AMOUNT_MAX;
    }

    private static function hasValidCategory(string $category): bool
    {
        return in_array(needle: $category, haystack: FinanceTransaction::CATEGORIES, strict: true);
    }

    private static function hasValidNote(string $note): bool
    {
        return mb_strlen(string: trim(string: $note)) <= self::NOTE_MAX_LENGTH;
    }

    private static function hasValidStore(?string $store): bool
    {
        return mb_strlen(string: trim(string: (string) $store)) <= self::STORE_MAX_LENGTH;
    }

    private static function hasValidDayOfMonth(int $dayOfMonth): bool
    {
        return $dayOfMonth >= self::DAY_OF_MONTH_MIN && $dayOfMonth <= self::DAY_OF_MONTH_MAX;
    }

    private static function hasValidMonth(string $month): bool
    {
        return 1 === preg_match(pattern: '/^\d{4}-\d{2}$/', subject: $month);
    }
}
