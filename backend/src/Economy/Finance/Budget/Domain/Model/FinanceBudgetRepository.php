<?php

namespace Economy\Finance\Budget\Domain\Model;

interface FinanceBudgetRepository
{
    public function nextId(): string;

    public function findById(string $id): ?FinanceBudget;

    public function findCurrent(): ?FinanceBudget;

    public function save(FinanceBudget $financeBudget): void;

    public function delete(FinanceBudget $financeBudget): void;
}
