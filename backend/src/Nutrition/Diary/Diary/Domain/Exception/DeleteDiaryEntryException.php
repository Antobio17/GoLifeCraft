<?php

namespace Nutrition\Diary\Diary\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class DeleteDiaryEntryException extends BaseException
{
    public static function diaryEntryNotFound(string $diaryEntryId): self
    {
        return new static(
            title: 'Diary entry not found.',
            keyTranslation: 'diary.entry.not.found',
            details: ['diaryEntryId' => $diaryEntryId]
        );
    }

    public static function notARecipeEntry(string $diaryEntryId): self
    {
        return new static(
            title: 'Only recipe entries have a breakdown.',
            keyTranslation: 'diary.entry.not.recipe',
            details: ['diaryEntryId' => $diaryEntryId]
        );
    }

    public static function treeNodeNotFound(string $diaryEntryId, string $nodeId): self
    {
        return new static(
            title: 'Breakdown item not found.',
            keyTranslation: 'diary.entry.tree.node.not.found',
            details: ['diaryEntryId' => $diaryEntryId, 'nodeId' => $nodeId]
        );
    }

    public static function lastTreeNode(string $diaryEntryId): self
    {
        return new static(
            title: 'The breakdown needs at least one ingredient.',
            keyTranslation: 'diary.entry.tree.last.node',
            details: ['diaryEntryId' => $diaryEntryId]
        );
    }
}
