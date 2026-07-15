<?php

namespace Nutrition\Diary\Diary\Domain\Model;

interface DiaryEntryRepository
{
    public function nextId(): string;

    public function findById(string $id): ?DiaryEntry;

    public function save(DiaryEntry $diaryEntry): void;

    public function delete(DiaryEntry $diaryEntry): void;
}
