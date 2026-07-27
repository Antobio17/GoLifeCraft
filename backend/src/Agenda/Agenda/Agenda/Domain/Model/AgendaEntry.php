<?php

namespace Agenda\Agenda\Agenda\Domain\Model;

use Agenda\Agenda\Agenda\Domain\Event\AgendaEntryCreated;
use Agenda\Agenda\Agenda\Domain\Event\AgendaEntryDeleted;
use Agenda\Agenda\Agenda\Domain\Event\AgendaEntryStatusChanged;
use Agenda\Agenda\Agenda\Domain\Event\AgendaEntryUpdated;
use Agenda\Agenda\Agenda\Domain\Exception\AgendaEntrySeriesException;
use Agenda\Agenda\Agenda\Domain\Exception\CreateAgendaEntryException;
use Agenda\Agenda\Agenda\Domain\Exception\UpdateAgendaEntryException;
use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class AgendaEntry extends GenericAggregate
{
    public const KIND_TASK = 'task';
    public const KIND_APPOINTMENT = 'appointment';

    /** @var array<int, string> */
    public const KINDS = [
        self::KIND_TASK,
        self::KIND_APPOINTMENT,
    ];

    /** @var array<int, string> */
    public const TASK_CATEGORIES = [
        'groceries',
        'cooking',
        'health',
        'exercise',
        'errand',
        'home',
        'personal',
        'other',
    ];

    /** @var array<int, string> */
    public const APPOINTMENT_CATEGORIES = [
        'nutritionist',
        'physio',
        'dentist',
        'doctor',
        'training',
        'bloodTest',
        'personal',
        'other',
    ];

    public const TITLE_MAX_LENGTH = 255;
    public const NOTES_MAX_LENGTH = 1000;
    public const SERIES_MAX_DAYS = 366;

    public string $entryDate;
    public ?string $time = null;
    public string $title;
    public string $kind;
    public string $category = '';
    public string $notes = '';
    public bool $done = false;
    public ?string $seriesId = null;

    public static function create(
        string $id,
        string $entryDate,
        ?string $time,
        string $title,
        string $kind,
        string $category,
        string $notes,
        ?string $seriesId,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if (!self::hasValidDate(entryDate: $entryDate)) {
            throw CreateAgendaEntryException::invalidDate(entryDate: $entryDate);
        }

        if (!self::hasValidTime(time: $time)) {
            throw CreateAgendaEntryException::invalidTime(time: (string) $time);
        }

        if (!self::hasValidTitle(title: $title)) {
            throw CreateAgendaEntryException::titleIsRequired();
        }

        if (!in_array(needle: $kind, haystack: self::KINDS, strict: true)) {
            throw CreateAgendaEntryException::invalidKind(kind: $kind);
        }

        if (!self::hasValidCategory(kind: $kind, category: $category)) {
            throw CreateAgendaEntryException::invalidCategory(category: $category, kind: $kind);
        }

        $now = $dateTimeGenerator->now();

        $entry = new self();
        $entry->id = $id;
        $entry->write(
            entryDate: $entryDate,
            time: $time,
            title: $title,
            kind: $kind,
            category: $category,
            notes: $notes,
        );
        $entry->done = false;
        $entry->seriesId = $seriesId;
        $entry->stampCreation(userId: $createdByUserId, now: $now);

        $entry->record(event: new AgendaEntryCreated(
            aggregateId: $id,
            occurredOn: $now,
            entryDate: $entry->entryDate,
            time: $entry->time,
            title: $entry->title,
            kind: $entry->kind,
            category: $entry->category,
            notes: $entry->notes,
            done: $entry->done,
            seriesId: $entry->seriesId,
            createdAt: $entry->createdAt,
            updatedAt: $entry->updatedAt,
            createdByUserId: $entry->createdByUserId,
            updatedByUserId: $entry->updatedByUserId,
        ));

        return $entry;
    }

    public function update(
        string $entryDate,
        ?string $time,
        string $title,
        string $kind,
        string $category,
        string $notes,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!self::hasValidDate(entryDate: $entryDate)) {
            throw UpdateAgendaEntryException::invalidDate(entryDate: $entryDate);
        }

        if (!self::hasValidTime(time: $time)) {
            throw UpdateAgendaEntryException::invalidTime(time: (string) $time);
        }

        if (!self::hasValidTitle(title: $title)) {
            throw UpdateAgendaEntryException::titleIsRequired();
        }

        if (!in_array(needle: $kind, haystack: self::KINDS, strict: true)) {
            throw UpdateAgendaEntryException::invalidKind(kind: $kind);
        }

        if (!self::hasValidCategory(kind: $kind, category: $category)) {
            throw UpdateAgendaEntryException::invalidCategory(category: $category, kind: $kind);
        }

        $now = $dateTimeGenerator->now();

        $this->write(
            entryDate: $entryDate,
            time: $time,
            title: $title,
            kind: $kind,
            category: $category,
            notes: $notes,
        );
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new AgendaEntryUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            entryDate: $this->entryDate,
            time: $this->time,
            title: $this->title,
            kind: $this->kind,
            category: $this->category,
            notes: $this->notes,
            done: $this->done,
            seriesId: $this->seriesId,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function changeStatus(
        bool $done,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();

        $this->done = $done;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new AgendaEntryStatusChanged(
            aggregateId: $this->id,
            occurredOn: $now,
            entryDate: $this->entryDate,
            time: $this->time,
            title: $this->title,
            kind: $this->kind,
            category: $this->category,
            notes: $this->notes,
            done: $this->done,
            seriesId: $this->seriesId,
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

        $this->record(event: new AgendaEntryDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
            entryDate: $this->entryDate,
            time: $this->time,
            title: $this->title,
            kind: $this->kind,
            category: $this->category,
            notes: $this->notes,
            done: $this->done,
            seriesId: $this->seriesId,
            deletedByUserId: $deletedByUserId,
        ));
    }

    /**
     * @return array<int, string>
     */
    public static function categoriesFor(string $kind): array
    {
        return self::KIND_APPOINTMENT === $kind ? self::APPOINTMENT_CATEGORIES : self::TASK_CATEGORIES;
    }

    /**
     * @return array<int, string>
     */
    public static function seriesDates(string $entryDate, string $endDate): array
    {
        if (!self::hasValidDate(entryDate: $entryDate)) {
            throw AgendaEntrySeriesException::invalidDate(date: $entryDate);
        }

        if (!self::hasValidDate(entryDate: $endDate)) {
            throw AgendaEntrySeriesException::invalidDate(date: $endDate);
        }

        if ($endDate < $entryDate) {
            throw AgendaEntrySeriesException::endDateBeforeStartDate(
                entryDate: $entryDate,
                endDate: $endDate,
            );
        }

        $dates = [];
        $cursor = new \DateTimeImmutable(datetime: $entryDate);
        $last = new \DateTimeImmutable(datetime: $endDate);

        while ($cursor <= $last) {
            if (self::SERIES_MAX_DAYS === count(value: $dates)) {
                throw AgendaEntrySeriesException::rangeTooLong(
                    entryDate: $entryDate,
                    endDate: $endDate,
                    maxDays: self::SERIES_MAX_DAYS,
                );
            }

            $dates[] = $cursor->format(format: 'Y-m-d');
            $cursor = $cursor->modify(modifier: '+1 day');
        }

        return $dates;
    }

    private function write(
        string $entryDate,
        ?string $time,
        string $title,
        string $kind,
        string $category,
        string $notes,
    ): void {
        $this->entryDate = $entryDate;
        $this->time = '' === (string) $time ? null : $time;
        $this->title = trim(string: $title);
        $this->kind = $kind;
        $this->category = $category;
        $this->notes = trim(string: $notes);
    }

    private static function hasValidDate(string $entryDate): bool
    {
        return 1 === preg_match(pattern: '/^\d{4}-\d{2}-\d{2}$/', subject: $entryDate);
    }

    private static function hasValidTime(?string $time): bool
    {
        if (null === $time || '' === $time) {
            return true;
        }

        return 1 === preg_match(pattern: '/^([01]\d|2[0-3]):[0-5]\d$/', subject: $time);
    }

    private static function hasValidTitle(string $title): bool
    {
        $title = trim(string: $title);

        return '' !== $title && mb_strlen(string: $title) <= self::TITLE_MAX_LENGTH;
    }

    private static function hasValidCategory(string $kind, string $category): bool
    {
        if ('' === $category) {
            return true;
        }

        return in_array(needle: $category, haystack: self::categoriesFor(kind: $kind), strict: true);
    }
}
