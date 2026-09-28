<?php

namespace Notification\Notification\Settings\Domain\Model;

enum NotificationType: string
{
    case AgendaAppointmentDayBefore = 'agenda.appointment.dayBefore';
    case AgendaAppointmentUpcoming = 'agenda.appointment.upcoming';

    public const string MODULE_AGENDA = 'agenda';

    public function module(): string
    {
        return match ($this) {
            self::AgendaAppointmentDayBefore, self::AgendaAppointmentUpcoming => self::MODULE_AGENDA,
        };
    }

    public function usesTime(): bool
    {
        return self::AgendaAppointmentDayBefore === $this;
    }

    public function usesLeadMinutes(): bool
    {
        return self::AgendaAppointmentUpcoming === $this;
    }

    /**
     * @return string[]
     */
    public static function values(): array
    {
        return array_map(
            callback: static fn (self $type): string => $type->value,
            array: self::cases(),
        );
    }
}
