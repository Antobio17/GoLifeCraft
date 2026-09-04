<?php

namespace Authorization\User\User\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class MyVisualPreferenceChanged extends DomainEvent
{
    /**
     * @param string[]              $surfaces
     * @param array<string, string> $visualPreferences
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public array $surfaces,
        public string $mode,
        public array $visualPreferences,
        public \DateTime $updatedAt,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.authorization.event.1.user.myVisualPreferenceChanged';
    }
}
