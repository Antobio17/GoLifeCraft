<?php

namespace App\Tests\Economy\Finance\Budget\Domain\Service;

use Economy\Finance\Budget\Domain\Service\FinanceBudgetPace;
use PHPUnit\Framework\TestCase;

final class FinanceBudgetPaceTest extends TestCase
{
    public function testItSpendsTheMonthLinearly(): void
    {
        $this->assertSame(
            expected: 0.5,
            actual: FinanceBudgetPace::monthProgress(month: '2026-04', today: '2026-04-15'),
        );
        $this->assertSame(
            expected: 1.0,
            actual: FinanceBudgetPace::monthProgress(month: '2026-03', today: '2026-04-15'),
        );
        $this->assertSame(
            expected: 0.0,
            actual: FinanceBudgetPace::monthProgress(month: '2026-05', today: '2026-04-15'),
        );
    }

    public function testItReportsTheDayOfTheMonthBeingLived(): void
    {
        $this->assertSame(
            expected: 15,
            actual: FinanceBudgetPace::dayOfMonth(month: '2026-04', today: '2026-04-15'),
        );
        $this->assertSame(
            expected: 31,
            actual: FinanceBudgetPace::dayOfMonth(month: '2026-03', today: '2026-04-15'),
        );
        $this->assertSame(
            expected: 0,
            actual: FinanceBudgetPace::dayOfMonth(month: '2026-05', today: '2026-04-15'),
        );
    }

    public function testItComparesTheSpendAgainstThePaceOfTheMonth(): void
    {
        $monthProgress = FinanceBudgetPace::monthProgress(month: '2026-04', today: '2026-04-15');

        $this->assertSame(
            expected: 150.0,
            actual: FinanceBudgetPace::expected(budget: 300.0, monthProgress: $monthProgress),
        );
        $this->assertSame(
            expected: 30.0,
            actual: FinanceBudgetPace::difference(budget: 300.0, spent: 120.0, monthProgress: $monthProgress),
        );
        $this->assertSame(
            expected: -40.0,
            actual: FinanceBudgetPace::difference(budget: 300.0, spent: 190.0, monthProgress: $monthProgress),
        );
    }

    public function testItFlagsACategoryThatBurnsFasterThanTheMonth(): void
    {
        $monthProgress = FinanceBudgetPace::monthProgress(month: '2026-04', today: '2026-04-15');

        $this->assertSame(
            expected: FinanceBudgetPace::STATUS_ON_TRACK,
            actual: FinanceBudgetPace::status(budget: 300.0, spent: 120.0, monthProgress: $monthProgress),
        );
        $this->assertSame(
            expected: FinanceBudgetPace::STATUS_AT_RISK,
            actual: FinanceBudgetPace::status(budget: 300.0, spent: 190.0, monthProgress: $monthProgress),
        );
        $this->assertSame(
            expected: FinanceBudgetPace::STATUS_OVER,
            actual: FinanceBudgetPace::status(budget: 300.0, spent: 320.0, monthProgress: $monthProgress),
        );
    }

    public function testItTreatsACategoryWithoutBudgetAsOverspentOnlyWhenItSpends(): void
    {
        $this->assertSame(
            expected: FinanceBudgetPace::STATUS_ON_TRACK,
            actual: FinanceBudgetPace::status(budget: 0.0, spent: 0.0, monthProgress: 0.5),
        );
        $this->assertSame(
            expected: FinanceBudgetPace::STATUS_OVER,
            actual: FinanceBudgetPace::status(budget: 0.0, spent: 10.0, monthProgress: 0.5),
        );
    }

    public function testItReadsSavingsTheOtherWayRound(): void
    {
        $this->assertSame(
            expected: FinanceBudgetPace::STATUS_ON_TRACK,
            actual: FinanceBudgetPace::savingsStatus(objective: 400.0, saved: 420.0, monthProgress: 0.5),
        );
        $this->assertSame(
            expected: FinanceBudgetPace::STATUS_AT_RISK,
            actual: FinanceBudgetPace::savingsStatus(objective: 400.0, saved: 240.0, monthProgress: 0.5),
        );
        $this->assertSame(
            expected: FinanceBudgetPace::STATUS_OVER,
            actual: FinanceBudgetPace::savingsStatus(objective: 400.0, saved: 80.0, monthProgress: 0.5),
        );
        $this->assertSame(
            expected: FinanceBudgetPace::STATUS_ON_TRACK,
            actual: FinanceBudgetPace::savingsStatus(objective: 0.0, saved: -50.0, monthProgress: 0.5),
        );
    }
}
