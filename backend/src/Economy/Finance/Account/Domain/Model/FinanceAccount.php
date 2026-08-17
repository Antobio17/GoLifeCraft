<?php

namespace Economy\Finance\Account\Domain\Model;

use Economy\Finance\Account\Domain\Event\FinanceAccountCreated;
use Economy\Finance\Account\Domain\Event\FinanceAccountDeleted;
use Economy\Finance\Account\Domain\Event\FinanceAccountUpdated;
use Economy\Finance\Account\Domain\Exception\CreateFinanceAccountException;
use Economy\Finance\Account\Domain\Exception\UpdateFinanceAccountException;
use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class FinanceAccount extends GenericAggregate
{
    public const TYPE_BANK = 'bank';
    public const TYPE_CASH = 'cash';
    public const TYPE_SAVINGS = 'savings';
    public const TYPE_CARD = 'card';
    public const TYPE_OTHER = 'other';

    public const NAME_MAX_LENGTH = 60;

    /** @var array<int, string> */
    public const TYPES = [
        self::TYPE_BANK,
        self::TYPE_CASH,
        self::TYPE_SAVINGS,
        self::TYPE_CARD,
        self::TYPE_OTHER,
    ];

    public string $name;
    public string $type = self::TYPE_BANK;

    public static function create(
        string $id,
        string $name,
        string $type,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
        ?float $initialBalance = null,
        string $initialBalanceDate = '',
    ): self {
        if (!self::hasValidName(name: $name)) {
            throw CreateFinanceAccountException::invalidName(maxLength: self::NAME_MAX_LENGTH);
        }

        if (!in_array(needle: $type, haystack: self::TYPES, strict: true)) {
            throw CreateFinanceAccountException::invalidType(type: $type);
        }

        if (null !== $initialBalance && !self::hasValidDate(date: $initialBalanceDate)) {
            throw CreateFinanceAccountException::invalidInitialBalanceDate(date: $initialBalanceDate);
        }

        $now = $dateTimeGenerator->now();

        $financeAccount = new self();
        $financeAccount->id = $id;
        $financeAccount->write(name: $name, type: $type);
        $financeAccount->stampCreation(userId: $createdByUserId, now: $now);

        $financeAccount->record(event: new FinanceAccountCreated(
            aggregateId: $id,
            occurredOn: $now,
            name: $financeAccount->name,
            type: $financeAccount->type,
            createdAt: $financeAccount->createdAt,
            updatedAt: $financeAccount->updatedAt,
            createdByUserId: $financeAccount->createdByUserId,
            updatedByUserId: $financeAccount->updatedByUserId,
            initialBalance: $initialBalance,
            initialBalanceDate: $initialBalanceDate,
        ));

        return $financeAccount;
    }

    public function update(
        string $name,
        string $type,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!self::hasValidName(name: $name)) {
            throw UpdateFinanceAccountException::invalidName(maxLength: self::NAME_MAX_LENGTH);
        }

        if (!in_array(needle: $type, haystack: self::TYPES, strict: true)) {
            throw UpdateFinanceAccountException::invalidType(type: $type);
        }

        $now = $dateTimeGenerator->now();

        $this->write(name: $name, type: $type);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new FinanceAccountUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
            type: $this->type,
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

        $this->record(event: new FinanceAccountDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
            type: $this->type,
            deletedByUserId: $deletedByUserId,
        ));
    }

    private function write(string $name, string $type): void
    {
        $this->name = trim(string: $name);
        $this->type = $type;
    }

    private static function hasValidDate(string $date): bool
    {
        return 1 === preg_match(pattern: '/^\d{4}-\d{2}-\d{2}$/', subject: $date);
    }

    private static function hasValidName(string $name): bool
    {
        $name = trim(string: $name);

        return '' !== $name && mb_strlen(string: $name) <= self::NAME_MAX_LENGTH;
    }
}
