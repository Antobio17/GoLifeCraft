<?php

namespace Nutrition\Pantry\Location\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Pantry\Location\Domain\Event\LocationCreated;
use Nutrition\Pantry\Location\Domain\Event\LocationDeleted;
use Nutrition\Pantry\Location\Domain\Event\LocationUpdated;
use Nutrition\Pantry\Location\Domain\Exception\CreateLocationException;
use Nutrition\Pantry\Location\Domain\Exception\UpdateLocationException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Location extends GenericAggregate
{
    public const int NAME_MAX_LENGTH = 60;

    /** What a location can hold: an article's stock or a recipe's cooked servings. */
    public const string ITEM_ARTICLE = 'article';
    public const string ITEM_RECIPE = 'recipe';

    /** @var array<int, string> */
    public const array ITEM_KINDS = [
        self::ITEM_ARTICLE,
        self::ITEM_RECIPE,
    ];
    public const int EMOJI_MAX_LENGTH = 16;
    public const int DESCRIPTION_MAX_LENGTH = 255;

    public string $name;
    public string $emoji = '';
    public string $description = '';

    public static function create(
        string $id,
        string $name,
        string $emoji,
        string $description,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if (!self::hasValidName(name: $name)) {
            throw CreateLocationException::invalidName(maxLength: self::NAME_MAX_LENGTH);
        }

        if (!self::hasValidEmoji(emoji: $emoji)) {
            throw CreateLocationException::invalidEmoji(maxLength: self::EMOJI_MAX_LENGTH);
        }

        if (!self::hasValidDescription(description: $description)) {
            throw CreateLocationException::invalidDescription(maxLength: self::DESCRIPTION_MAX_LENGTH);
        }

        $now = $dateTimeGenerator->now();

        $location = new self();
        $location->id = $id;
        $location->write(name: $name, emoji: $emoji, description: $description);
        $location->stampCreation(userId: $createdByUserId, now: $now);

        $location->record(event: new LocationCreated(
            aggregateId: $id,
            occurredOn: $now,
            name: $location->name,
            emoji: $location->emoji,
            description: $location->description,
            createdAt: $location->createdAt,
            updatedAt: $location->updatedAt,
            createdByUserId: $location->createdByUserId,
            updatedByUserId: $location->updatedByUserId,
        ));

        return $location;
    }

    public function update(
        string $name,
        string $emoji,
        string $description,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!self::hasValidName(name: $name)) {
            throw UpdateLocationException::invalidName(maxLength: self::NAME_MAX_LENGTH);
        }

        if (!self::hasValidEmoji(emoji: $emoji)) {
            throw UpdateLocationException::invalidEmoji(maxLength: self::EMOJI_MAX_LENGTH);
        }

        if (!self::hasValidDescription(description: $description)) {
            throw UpdateLocationException::invalidDescription(maxLength: self::DESCRIPTION_MAX_LENGTH);
        }

        $now = $dateTimeGenerator->now();

        $this->write(name: $name, emoji: $emoji, description: $description);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new LocationUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
            emoji: $this->emoji,
            description: $this->description,
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

        $this->record(event: new LocationDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
            emoji: $this->emoji,
            description: $this->description,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            deletedByUserId: $deletedByUserId,
        ));
    }

    private function write(string $name, string $emoji, string $description): void
    {
        $this->name = trim(string: $name);
        $this->emoji = trim(string: $emoji);
        $this->description = trim(string: $description);
    }

    private static function hasValidName(string $name): bool
    {
        $name = trim(string: $name);

        return '' !== $name && mb_strlen(string: $name) <= self::NAME_MAX_LENGTH;
    }

    private static function hasValidEmoji(string $emoji): bool
    {
        return mb_strlen(string: trim(string: $emoji)) <= self::EMOJI_MAX_LENGTH;
    }

    private static function hasValidDescription(string $description): bool
    {
        return mb_strlen(string: trim(string: $description)) <= self::DESCRIPTION_MAX_LENGTH;
    }
}
