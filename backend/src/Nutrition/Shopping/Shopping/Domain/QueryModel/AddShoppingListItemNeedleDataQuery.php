<?php

namespace Nutrition\Shopping\Shopping\Domain\QueryModel;

interface AddShoppingListItemNeedleDataQuery
{
    public function articleExists(string $articleId): bool;

    public function articleAlreadyInList(string $articleId): bool;
}
