<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CreateDiaryEntryCommand implements Command
{
    /**
     * @param array<int, array<string, mixed>> $tree breakdown the entry is born with, when it comes already adjusted
     */
    public function __construct(
        public string $entryDate,
        public string $meal,
        public string $kind,
        public string $refId,
        public float $quantity,
        public ?string $unit,
        public string $createdByUserId,
        public array $tree = [],
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.diary_entry.create';
    }
}
