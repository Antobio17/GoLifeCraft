<?php

namespace Gamification\Achievement\Achievement\Domain\QueryModel\Dto;

final readonly class AchievementOwner
{
    public function __construct(
        public string $userId,
        public string $tenantId,
    ) {
    }
}
