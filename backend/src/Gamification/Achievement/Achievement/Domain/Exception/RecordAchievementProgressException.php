<?php

namespace Gamification\Achievement\Achievement\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class RecordAchievementProgressException extends BaseException
{
    public static function unknownDefinition(string $definitionKey): self
    {
        return new static(
            title: 'The achievement does not exist.',
            keyTranslation: 'achievement.not.found',
            details: ['definitionKey' => $definitionKey]
        );
    }

    public static function definitionMismatch(string $definitionKey, string $progressDefinitionKey): self
    {
        return new static(
            title: 'The occurrence belongs to another achievement.',
            keyTranslation: 'achievement.definition.mismatch',
            details: ['definitionKey' => $definitionKey, 'progressDefinitionKey' => $progressDefinitionKey]
        );
    }

    public static function invalidOccurrenceDate(string $occurredOn): self
    {
        return new static(
            title: 'The occurrence date is not a valid ISO 8601 date-time.',
            keyTranslation: 'achievement.occurrence.invalid',
            details: ['occurredOn' => $occurredOn]
        );
    }
}
