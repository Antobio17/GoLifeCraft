<?php

namespace Gamification\Achievement\Achievement\Domain\Model;

enum AchievementTier: string
{
    case Bronze = 'bronze';
    case Silver = 'silver';
    case Gold = 'gold';
    case Platinum = 'platinum';

    public static function atLevel(int $level): self
    {
        return self::cases()[$level];
    }

    public static function levels(): int
    {
        return count(value: self::cases());
    }
}
