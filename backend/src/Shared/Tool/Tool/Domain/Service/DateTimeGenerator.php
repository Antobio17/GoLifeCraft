<?php

namespace Shared\Tool\Tool\Domain\Service;

final class DateTimeGenerator
{
    public function now(?string $timeZone = null): \DateTime
    {
        $dateTimeZone = $timeZone ?
            new \DateTimeZone(timezone: $timeZone) :
            new \DateTimeZone(timezone: 'UTC');

        return new \DateTime(datetime: 'now', timezone: $dateTimeZone);
    }
}
