<?php

namespace Economy\Finance\Account\Domain\QueryModel;

interface CreateFinanceAccountNeedleDataQuery
{
    public function alreadyExists(string $name): bool;
}
