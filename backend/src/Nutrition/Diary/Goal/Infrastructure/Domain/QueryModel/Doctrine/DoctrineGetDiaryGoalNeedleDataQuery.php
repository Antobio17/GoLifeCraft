<?php

namespace Nutrition\Diary\Goal\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Diary\Goal\Domain\Model\DiaryGoal;
use Nutrition\Diary\Goal\Domain\QueryModel\Dto\GetDiaryGoalResult;
use Nutrition\Diary\Goal\Domain\QueryModel\GetDiaryGoalNeedleDataQuery;

final readonly class DoctrineGetDiaryGoalNeedleDataQuery implements GetDiaryGoalNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findDiaryGoal(): GetDiaryGoalResult
    {
        $row = $this->connection->createQueryBuilder()
            ->select('g.calories', 'g.protein', 'g.fat', 'g.carbs')
            ->from(table: 'diary_goal', alias: 'g')
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchAssociative();

        return new GetDiaryGoalResult(
            id: DiaryGoal::SINGLETON_ID,
            aggregateName: 'DiaryGoal',
            calories: false !== $row ? (float) $row['calories'] : DiaryGoal::DEFAULT_CALORIES,
            protein: false !== $row ? (float) $row['protein'] : DiaryGoal::DEFAULT_PROTEIN,
            fat: false !== $row ? (float) $row['fat'] : DiaryGoal::DEFAULT_FAT,
            carbs: false !== $row ? (float) $row['carbs'] : DiaryGoal::DEFAULT_CARBS,
        );
    }
}
